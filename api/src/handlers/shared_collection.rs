use crate::{
    db::mongodb::MongoORM,
    guards::has_session::HasSession,
    models::{
        collection_image::CollectionImage,
        shared_collection::{SharedCollection, SharedCollectionCreate},
    },
};
use bcrypt::{hash, verify};
use mongodb::{bson::oid::ObjectId, results::InsertOneResult};
use rocket::{http::Status, serde::json::Json, State};

/// Adds a new `SharedCollection`.
/// Notice that the frontend needs to send a `SharedColllectinCreate` struct.
///
/// `hash` has to be unique.
/// #### **ADD A UNIQUE COMPOMPOUND INDEX ON THE DATABASE COLLECTION LEVEL**
/// #### Reference: <https://www.mongodb.com/docs/manual/core/index-unique/#unique-compound-index>
#[post("/collection", format = "json", data = "<new_collection>")]
pub fn add_collection(
    db: &State<MongoORM>,
    _has_session: HasSession,
    new_collection: Json<SharedCollectionCreate>,
) -> Result<(Status, Json<InsertOneResult>), Status> {
    let _id = ObjectId::new();

    let mut images: Vec<CollectionImage> = vec![];
    for image in new_collection.images.iter() {
        let _id = ObjectId::new();
        let c_image = CollectionImage {
            _id,
            url: image.url.to_owned(),
            description: image.description.to_owned(),
            tags: image.tags.to_owned(),
            order: image.order.to_owned(),
            comments: image.comments.to_owned(),
            created_at: _id.timestamp(),
        };
        images.push(c_image);
    }

    // hash the PW if it is present, otherwise return None
    let hashed_pw = match &new_collection.password {
        Some(val) => {
            let hashed_pw = match hash(&val, 4) {
                Ok(val) => val,
                Err(_) => panic!("Error hashing the password."),
            };
            Some(hashed_pw)
        }
        None => None,
    };

    let photo_box = match db.get_photo_box_by_id(&new_collection.photo_box_id) {
        Ok(pb) => pb,
        Err(_) => return Err(Status::InternalServerError),
    };

    let collection = SharedCollection {
        _id,
        description: new_collection.description.to_owned(),
        hash: new_collection.hash.to_owned(),
        photo_box_display_name: photo_box.display_name,
        photo_box_description: photo_box.description,
        images,
        password: hashed_pw,
        created_at: _id.timestamp(),
    };

    let inserted_collection_result = db.create_collection(collection);
    match inserted_collection_result {
        Ok(collection_id) => Ok((Status::Created, Json(collection_id))),
        Err(_) => Err(Status::InternalServerError),
    }
}

/// Get all SharedCollections.
#[get("/collections")]
pub fn get_all_collections(
    db: &State<MongoORM>,
    _has_session: HasSession,
) -> Result<(Status, Json<Vec<SharedCollection>>), Status> {
    let collections = db.get_all_collections();
    match collections {
        Ok(collections) => Ok((Status::Ok, Json(collections))),
        Err(_) => Err(Status::InternalServerError),
    }
}

/// Returns a single SharedCollection identified by its hash.
/// The url patter is either
/// `/api/collection/?hash=s2NfOpDatUXjPhqWO4joLnMIZ` without password protection
/// or
/// /api/collection/?hash=s2NfOpDatUXjPhqWO4joLnMIZ&password=test with password protection
#[get("/collection?<hash>&<password>")]
pub fn get_collection_by_hash(
    db: &State<MongoORM>,
    hash: String,
    password: Option<String>,
) -> Result<(Status, Json<SharedCollection>), Status> {
    if hash.is_empty() {
        return Err(Status::BadRequest);
    }

    let shared_collection = db.get_collection_by_hash(&hash);

    let collection = match shared_collection {
        Ok(shared_collection) => shared_collection,
        Err(_) => return Err(Status::InternalServerError),
    };

    let password_protected = collection.password.is_some();

    println!("is password protected: {password_protected}");

    if password_protected {
        // 1) get the user password if a password is needed
        let password = match password {
            Some(pw) => pw,
            None => return Err(Status::BadRequest),
        };

        // 2) get the collection password
        let collection_password = collection.password.as_ref().unwrap();

        // 3) compare both passwords
        let res = match verify(password, collection_password) {
            Ok(r) => r,
            Err(_) => return Err(Status::Unauthorized),
        };

        // 4) return Unauthorized if the given password doen't match the collection password
        if !res {
            return Err(Status::Unauthorized);
        }
    }

    Ok((Status::Ok, Json(collection)))
}
