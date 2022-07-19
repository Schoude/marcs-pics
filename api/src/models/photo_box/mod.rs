/// MongoDB document schema of PhotoBox.
/// ```jsonc
/// {
///   "_id": ObjectId('3032ef76-ac01-4730-b540-a705a2139d18'),
///   "owner_id": ObjectId('9a895880-c891-426f-80dc-ed0094a1a455'),
///   "firebase_root_folder_name": "marcs-pics",
///   "firebase_folder_name": "usa2022",
///   "photo_box_name": "USA Reise 2022",
///   "description": "The photos of my trip to the USA!",
///
///   // can be empty but not missing
///   "tags": [
///     "USA",
///     "groundhopping",
///     "2022"
///   ],
///
///   // plain urls of all the images of the photo_box - the ordering is arbitrary.
///   "urls": [
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
pub struct PhotoBox {
    _id: String,
    owner_id: String,
    firebase_root_folder_name: String,
    firebase_folder_name: String,
    photo_box_name: String,
    description: String,
    tags: Vec<String>,
    urls: Vec<String>,
    created_at: String,
}
