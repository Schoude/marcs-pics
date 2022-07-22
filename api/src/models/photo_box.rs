use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};

/// MongoDB document schema of PhotoBox.
/// ```jsonc
/// {
///   "_id": ObjectId('3032ef76-ac01-4730-b540-a705a2139d18'),
///   "owner_id": ObjectId('9a895880-c891-426f-80dc-ed0094a1a455'),
///   "firebase_root_folder_name": "marcs-pics",
///   "firebase_folder_name": "usa2022",
///   "display_name": "USA Reise 2022",
///   "description": "The photos of my trip to the USA!",
///
///   // can be empty but not missing
///   "tags": [
///     "USA",
///     "groundhopping",
///     "2022"
///   ],
///
///   // plain urls of all the images of the photo_box - the ordering is arbitrary
///   // MAY NOT BE NEEDED. THE ROOT AND FOLDER NAME OF FIREBASE RETURN THESE URLS
///   "photo_urls": [
///     "https://marcs-pics-usa2022.firebase.com/image1",
///     "https://marcs-pics-usa2022.firebase.com/image2",
///     "https://marcs-pics-usa2022.firebase.com/image3",
///     "https://marcs-pics-usa2022.firebase.com/image4",
///     "https://marcs-pics-usa2022.firebase.com/image4",
///   ],
///
///   // or get from the "_id" ObjectId instance of available
///   "created_at": UTC-Date
/// }
/// ```
#[derive(Debug, Serialize, Deserialize)]
pub struct PhotoBox {
    pub _id: ObjectId,
    pub owner_id: ObjectId,
    pub firebase_root_folder_name: String,
    pub firebase_folder_name: String,
    pub display_name: String,
    pub description: String,
    pub tags: Vec<String>,
    pub created_at: DateTime,
}

/// Helper struct that is sent from the frontend.
/// `_id` and `created_at` are generated in the hanlder function.
/// The `owner_id` gets converted from a String into an `ObjectId`.
#[derive(Debug, Serialize, Deserialize)]
pub struct PhotoBoxCreate {
    pub owner_id: String,
    pub firebase_root_folder_name: String,
    pub firebase_folder_name: String,
    pub display_name: String,
    pub description: String,
    pub tags: Vec<String>,
}
