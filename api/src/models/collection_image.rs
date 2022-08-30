use super::collection_image_comment::CollectionImageComment;
use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};

/// MongoDB document schema for CollectionImage.
/// ```jsonc
/// {
///   "_id": ObjectId('4bdd44ad-051c-4205-9aa6-d31890b29d3e'),
///   "url": "https://marcs-pics-usa2022.firebase.com/image1",
///   "description": "This is a cool photo of me!",
///
///   // copy the tags of the original photo_box
///   "tags": [
///     "USA",
///     "groundhopping",
///     "2022"
///   ],
///   "order": 0,
///
///   // for now NO user accounts are planned to be added.
///   // all comments are made by guests who have to give at least a name.
///   // struct CollectionImageComment
///   "comments": [{
///     "_id": ObjectId('e0972587-5d56-4dab-a4a9-419e2222c3ec'),
///     "creator_name": "Tester",
///     "creator_email": "t3st3r@gmx.com",
///     "text": "Schöne Fotos!",
///     "created_at": UTC-Data
///   }],
///
///   // or get from the "_id" ObjectId instance of available
///   "created_at": UTC-Date
/// }
/// ```
#[derive(Debug, Serialize, Deserialize)]
pub struct CollectionImage {
    pub _id: ObjectId,
    pub url: String,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub order: u16,
    pub comments: Vec<CollectionImageComment>,
    pub created_at: DateTime,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CollectionImageCreate {
    pub url: String,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub order: u16,
    pub comments: Vec<CollectionImageComment>,
}
