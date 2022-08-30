use crate::{
    db::mongodb::MongoORM,
    guards::has_session::HasSession,
    models::{
        collection_image::CollectionImage,
        shared_collection::{SharedCollection, SharedCollectionCreate},
    },
};
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

    let collection = SharedCollection {
        _id,
        description: new_collection.description.to_owned(),
        hash: new_collection.hash.to_owned(),
        photo_box_id: ObjectId::parse_str(&new_collection.photo_box_id).unwrap(),
        images,
        // TODO: crypt the PW if it is present
        password: new_collection.password.to_owned(),
        created_at: _id.timestamp(),
    };

    let inserted_collection_result = db.create_collection(collection);
    match inserted_collection_result {
        Ok(collection_id) => Ok((Status::Created, Json(collection_id))),
        Err(_) => Err(Status::InternalServerError),
    }
}
