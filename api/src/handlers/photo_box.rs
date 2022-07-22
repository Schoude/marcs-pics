use crate::{
    db::mongodb::MongoORM,
    models::photo_box::{PhotoBox, PhotoBoxCreate},
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
    new_photo_box: Json<PhotoBoxCreate>,
) -> Result<(Status, Json<InsertOneResult>), Status> {
    let _id = ObjectId::new();
    let photo_box = PhotoBox {
        _id,
        owner_id: ObjectId::parse_str(&new_photo_box.owner_id).unwrap(),
        firebase_root_folder_name: new_photo_box.firebase_root_folder_name.to_owned(),
        firebase_folder_name: new_photo_box.firebase_folder_name.to_owned(),
        display_name: new_photo_box.display_name.to_owned(),
        description: new_photo_box.description.to_owned(),
        tags: new_photo_box.tags.to_owned(),
        created_at: _id.timestamp(),
    };

    let inserted_photo_box_result = db.create_photo_box(photo_box);
    match inserted_photo_box_result {
        Ok(photo_box_id) => Ok((Status::Created, Json(photo_box_id))),
        Err(_) => Err(Status::InternalServerError),
    }
}

/// Get all PhotoBoxes.
#[get("/photo-boxes")]
pub fn get_all_photo_boxes(db: &State<MongoORM>) -> Result<(Status, Json<Vec<PhotoBox>>), Status> {
    let photo_boxes = db.get_all_photo_boxes();
    match photo_boxes {
        Ok(photo_boxes) => Ok((Status::Ok, Json(photo_boxes))),
        Err(_) => Err(Status::InternalServerError),
    }
}
