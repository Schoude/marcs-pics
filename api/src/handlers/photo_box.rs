use mongodb::bson::oid::ObjectId;
use rocket::{http::Status, serde::json::Json, State};

use crate::{
    db::mongodb::MongoORM,
    models::photo_box::{PhotoBox, PhotoBoxCreate},
};

/// Adds a new `PhotoBox`.
/// Notice that the frontend needs to send a `PhotoBoxCreate` struct.
#[post("/photo-box", format = "json", data = "<new_photo_box>")]
pub fn add_photo_box(
    _db: &State<MongoORM>,
    new_photo_box: Json<PhotoBoxCreate>,
) -> Result<Status, Status> {
    let _id = ObjectId::new();
    let photo_box = PhotoBox {
        _id,
        owner_id: ObjectId::parse_str(new_photo_box.owner_id.to_owned()).unwrap(),
        firebase_root_folder_name: new_photo_box.firebase_root_folder_name.to_owned(),
        firebase_folder_name: new_photo_box.firebase_folder_name.to_owned(),
        display_name: new_photo_box.display_name.to_owned(),
        description: new_photo_box.description.to_owned(),
        tags: new_photo_box.tags.to_owned(),
        created_at: _id.timestamp(),
    };

    println!("{:?}", photo_box);
    Ok(Status::Created)
}
