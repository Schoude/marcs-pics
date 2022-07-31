use crate::{
    db::mongodb::MongoORM,
    guards::has_session::HasSession,
    models::photo_box::{PhotoBox, PhotoBoxCreate, PhotoBoxUpdate},
};
use mongodb::{bson::oid::ObjectId, results::InsertOneResult};
use rocket::{http::Status, serde::json::Json, State};

/// Adds a new `PhotoBox`.
/// Notice that the frontend needs to send a `PhotoBoxCreate` struct.
///
/// `firebase_folder_name` has to be unique.
/// #### **ADD A UNIQUE COMPOMPOUND INDEX ON THE DATABASE COLLECTION LEVEL**
/// #### Reference: <https://www.mongodb.com/docs/manual/core/index-unique/#unique-compound-index>
#[post("/photo-box", format = "json", data = "<new_photo_box>")]
pub fn add_photo_box(
    db: &State<MongoORM>,
    _has_session: HasSession,
    new_photo_box: Json<PhotoBoxCreate>,
) -> Result<(Status, Json<InsertOneResult>), Status> {
    let _id = ObjectId::new();
    let photo_box = PhotoBox {
        _id,
        owner_id: ObjectId::parse_str(&new_photo_box.owner_id).unwrap(),
        folder_name: new_photo_box.folder_name.to_owned(),
        display_name: new_photo_box.display_name.to_owned(),
        description: new_photo_box.description.to_owned(),
        urls: new_photo_box.urls.to_owned(),
        tags: new_photo_box.tags.to_owned(),
        created_at: _id.timestamp(),
    };

    let inserted_photo_box_result = db.create_photo_box(photo_box);
    match inserted_photo_box_result {
        Ok(photo_box_id) => Ok((Status::Created, Json(photo_box_id))),
        Err(_) => Err(Status::InternalServerError),
    }
}

/// Updates all of a a PhotoBox's fields except the `owner_id`.
#[put("/photo-box/<id>", data = "<photo_box_update>")]
pub fn update_photo_box(
    db: &State<MongoORM>,
    _has_session: HasSession,
    id: String,
    photo_box_update: Json<PhotoBoxCreate>,
) -> Result<(Status, Json<PhotoBox>), Status> {
    if id.is_empty() {
        return Err(Status::BadRequest);
    }

    let update = PhotoBoxUpdate {
        folder_name: photo_box_update.folder_name.to_owned(),
        display_name: photo_box_update.display_name.to_owned(),
        description: photo_box_update.description.to_owned(),
        urls: photo_box_update.urls.to_owned(),
        tags: photo_box_update.tags.to_owned(),
    };

    let update_res = db.update_photo_box(&id, update);
    match update_res {
        Ok(update) => {
            if update.matched_count == 1 {
                let updated_photo_box = db.get_photo_box_by_id(&id);
                match updated_photo_box {
                    Ok(photo_box) => Ok((Status::Ok, Json(photo_box))),
                    Err(_) => Err(Status::InternalServerError),
                }
            } else {
                Err(Status::NotFound)
            }
        }
        Err(_) => Err(Status::InternalServerError),
    }
}

/// Returns a single PhotoBox identified by its ObjectId.
#[get("/photo-box/<id>")]
pub fn get_photo_box_by_id(
    db: &State<MongoORM>,
    id: String,
    _has_session: HasSession,
) -> Result<(Status, Json<PhotoBox>), Status> {
    if id.is_empty() {
        return Err(Status::BadRequest);
    }

    let photo_box = db.get_photo_box_by_id(&id);
    match photo_box {
        Ok(photo_box) => Ok((Status::Ok, Json(photo_box))),
        Err(_) => Err(Status::InternalServerError),
    }
}

/// Get all PhotoBoxes.
#[get("/photo-boxes")]
pub fn get_all_photo_boxes(
    db: &State<MongoORM>,
    _has_session: HasSession,
) -> Result<(Status, Json<Vec<PhotoBox>>), Status> {
    let photo_boxes = db.get_all_photo_boxes();
    match photo_boxes {
        Ok(photo_boxes) => Ok((Status::Ok, Json(photo_boxes))),
        Err(_) => Err(Status::InternalServerError),
    }
}
