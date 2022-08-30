use super::collection_image::{CollectionImage, CollectionImageCreate};
use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};

/// MongoDB document scheme of SharedCollection
/// ```jsonc
/// // struct SharedCollection
/// {
///   "_id": ObjectId('e7b2645d-e2fc-49e8-af32-800fa05a831f'),
///
///   // password field is optional
///   "password": "$bryptedpw",
///   "photo_box_id": ObjectId('3032ef76-ac01-4730-b540-a705a2139d18'),
///
///   // create a search index for the "hash" field
///   "hash": "da1j4djAbi1k4498iYk8",
///   "description": "The photos of my trip to the USA!",
///
///   // struct CollectionImage
///   "images": [{
///     "_id": ObjectId('4bdd44ad-051c-4205-9aa6-d31890b29d3e'),
///     "url": "https://marcs-pics-usa2022.firebase.com/image1",
///     "description": "This is a cool photo of me!",
///
///     // copy the tags of the original photo_box
///     "tags": [
///       "USA",
///       "groundhopping",
///       "2022"
///     ],
///     "order": 0,
///
///     // for now NO user accounts are planned to be added.
///     // all comments are made by guests who have to give at least a name.
///     // struct CollectionImageComment
///     "comments": [{
///       "_id": ObjectId('e0972587-5d56-4dab-a4a9-419e2222c3ec'),
///       "creator_name": "Tester",
///       "creator_email": "t3st3r@gmx.com",
///       "text": "Schöne Fotos!",
///       "created_at": UTC-Data
///     }],
///
///     // or get from the "_id" ObjectId instance of available
///     "created_at": UTC-Date
///   }]
/// }
/// ```
#[derive(Debug, Serialize, Deserialize)]
pub struct SharedCollection {
    pub _id: ObjectId,
    pub photo_box_id: ObjectId,
    pub password: Option<String>,
    pub hash: String,
    pub description: String,
    pub images: Vec<CollectionImage>,
    pub created_at: DateTime,
}

/// Helper struct that is sent from the frontend.
/// `_id` and `created_at` are generated in the hanlder function.
/// The `photo_box_id` gets converted from a String into an `ObjectId`.
#[derive(Debug, Serialize, Deserialize)]
pub struct SharedCollectionCreate {
    pub photo_box_id: String,
    pub password: Option<String>,
    pub hash: String,
    pub description: String,
    pub images: Vec<CollectionImageCreate>,
}
