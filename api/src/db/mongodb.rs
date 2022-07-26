extern crate dotenv;
use crate::models::{
    auth::UserSession,
    photo_box::{PhotoBox, PhotoBoxUpdate},
    shared_collection::SharedCollection,
    user::{User, UserFound, UserUpdate},
};
use dotenv::dotenv;
use mongodb::{
    bson::{doc, extjson::de::Error, oid::ObjectId},
    options::FindOneOptions,
    results::{DeleteResult, InsertOneResult, UpdateResult},
    sync::{Client, Collection},
};
use std::env;

const DB_NAME: &str = "marcs_pics";
const USER_COLLECTION_NAME: &str = "users";
const PHOTO_BOX_COLLECTION_NAME: &str = "photo_boxes";
const USER_SESSIONS_COLLECTION_NAME: &str = "user_sessions";
const SHARED_COLLECTIONS_COLLECTION_NAME: &str = "shared_collections";

/// Wrapper around the MongoDB client with all collections.
pub struct MongoORM {
    user_collection: Collection<User>,
    photo_boxes_collection: Collection<PhotoBox>,
    user_sessions_collection: Collection<UserSession>,
    shared_collections_collection: Collection<SharedCollection>,
}

impl MongoORM {
    /// Initializes the MongoDB client.
    /// Depending on the `ENVIRONMENT` value in the `.env` files the client connects
    /// to the local database or the MongoDB Atlas cluster.
    pub fn init() -> Self {
        dotenv().ok();
        let env = match env::var("ENVIRONMENT") {
            Ok(val) => val,
            Err(e) => format!("Error loading the env variable: {e}"),
        };

        let uri = if env == "development" {
            match env::var("MONGOURI") {
                Ok(val) => val,
                Err(e) => format!("Error loading the env variable: {e}"),
            }
        } else {
            match env::var("MONGOURI_PROD") {
                Ok(val) => val,
                Err(e) => format!("Error loading the env variable: {e}"),
            }
        };

        // create the client and init the MongoORM struct with associated DB name the user collection.
        let client = match Client::with_uri_str(uri) {
            Ok(c) => c,
            Err(_) => panic!("Error connection to the URI."),
        };
        let db = client.database(DB_NAME);
        let user_collection = db.collection::<User>(USER_COLLECTION_NAME);
        let photo_boxes_collection = db.collection::<PhotoBox>(PHOTO_BOX_COLLECTION_NAME);

        let user_sessions_collection = db.collection::<UserSession>(USER_SESSIONS_COLLECTION_NAME);
        let shared_collections_collection =
            db.collection::<SharedCollection>(SHARED_COLLECTIONS_COLLECTION_NAME);

        MongoORM {
            user_collection,
            photo_boxes_collection,
            user_sessions_collection,
            shared_collections_collection,
        }
    }

    /// Inserts a single new user into the database.
    pub fn create_user(&self, new_user: User) -> Result<InsertOneResult, Error> {
        let inserted_user = self
            .user_collection
            .insert_one(new_user, None)
            .expect("Error creating user in DB.");
        Ok(inserted_user)
    }

    /// Returns a single user identified by the ObjectId.
    pub fn get_user_by_id(&self, id: &String) -> Result<UserFound, Error> {
        let obj_id = match ObjectId::parse_str(id) {
            Ok(oid) => oid,
            Err(e) => return Err(Error::InvalidObjectId(e)),
        };
        let filter = doc! { "_id": obj_id };
        let filter_options = Some(
            FindOneOptions::builder()
                .projection(Some(doc! {"password": 0}))
                .build(),
        );
        let found_user = self
            .user_collection
            .clone_with_type::<UserFound>()
            .find_one(filter, filter_options)
            .expect("Error getting the user ")
            .unwrap();
        Ok(found_user)
    }

    /// Returns a single user _(including the hashed password)_ identified by the its email address.
    pub fn get_user_by_email_full(&self, email: &String) -> Result<User, Error> {
        let filter = doc! { "email": email };
        let found_user = self
            .user_collection
            .find_one(filter, None)
            .expect("Error getting the user ")
            .unwrap();
        Ok(found_user)
    }

    /// Updates a Users `nickname` or `email` and returns the modified User.
    pub fn update_nickname_or_email(
        &self,
        id: &String,
        user_update: UserUpdate,
    ) -> Result<UpdateResult, Error> {
        let obj_id = match ObjectId::parse_str(id) {
            Ok(oid) => oid,
            Err(e) => return Err(Error::InvalidObjectId(e)),
        };
        let filter = doc! { "_id": obj_id };
        let update = doc! {
            "$set": {
                "nickname": user_update.nickname,
                "email": user_update.email,
            }
        };
        let updated_res = self
            .user_collection
            .update_one(filter, update, None)
            .expect("Error updating User");
        Ok(updated_res)
    }

    /// Deletes the User for the given id.
    pub fn delete_user_by_id(&self, id: &String) -> Result<DeleteResult, Error> {
        let obj_id = match ObjectId::parse_str(id) {
            Ok(oid) => oid,
            Err(e) => return Err(Error::InvalidObjectId(e)),
        };
        let filter = doc! { "_id": obj_id };
        let delete_result = self
            .user_collection
            .delete_one(filter, None)
            .expect("Error deleting user");

        Ok(delete_result)
    }

    /// Gets all Users.
    pub fn get_all_users(&self) -> Result<Vec<UserFound>, Error> {
        let user_cursor = self
            .user_collection
            .clone_with_type::<UserFound>()
            .find(None, None)
            .expect("Error getting all users");
        let users = user_cursor.map(|doc| doc.unwrap()).collect();
        Ok(users)
    }

    /// Inserts a single PhotoBox.
    pub fn create_photo_box(&self, new_photo_box: PhotoBox) -> Result<InsertOneResult, Error> {
        let inserted_photo_box = self
            .photo_boxes_collection
            .insert_one(new_photo_box, None)
            .expect("Error inserting the PhotoBox");
        Ok(inserted_photo_box)
    }

    /// Returns all PhotoBoxes.
    pub fn get_all_photo_boxes(&self) -> Result<Vec<PhotoBox>, Error> {
        let photo_boxes_cursor = self
            .photo_boxes_collection
            .find(None, None)
            .expect("Error getting all PhotoBoxes");
        let photo_boxes = photo_boxes_cursor.map(|doc| doc.unwrap()).collect();
        Ok(photo_boxes)
    }

    /// Returns a single PhotoBox identified by the ObjectId.
    pub fn get_photo_box_by_id(&self, id: &String) -> Result<PhotoBox, Error> {
        let obj_id = match ObjectId::parse_str(id) {
            Ok(oid) => oid,
            Err(e) => return Err(Error::InvalidObjectId(e)),
        };
        let filter = doc! { "_id": obj_id };
        let found_photo_box = self
            .photo_boxes_collection
            .find_one(filter, None)
            .expect("Error getting the PhotoBox.")
            .unwrap();
        Ok(found_photo_box)
    }

    /// Updates a PhotoBoxes field except the `owner_id`.
    pub fn update_photo_box(
        &self,
        id: &String,
        photo_box_update: PhotoBoxUpdate,
    ) -> Result<UpdateResult, Error> {
        let obj_id = match ObjectId::parse_str(id) {
            Ok(oid) => oid,
            Err(e) => return Err(Error::InvalidObjectId(e)),
        };
        let filter = doc! { "_id": obj_id };
        let update = doc! {
            "$set": {
                "folder_name": photo_box_update.folder_name,
                "display_name": photo_box_update.display_name,
                "description": photo_box_update.description,
                "tags": photo_box_update.tags,
            }
        };
        let updated_res = self
            .photo_boxes_collection
            .update_one(filter, update, None)
            .expect("Error updating PhotoBox");
        Ok(updated_res)
    }

    /// Adds a url to the PhotoBoxes.
    pub fn add_url_to_photo_box(
        &self,
        folder_name: &String,
        url: &String,
    ) -> Result<UpdateResult, Error> {
        let filter = doc! { "folder_name": folder_name };
        let update = doc! {
            "$push": {
                "urls": url,
            }
        };
        let updated_res = self
            .photo_boxes_collection
            .update_one(filter, update, None)
            .expect("Error adding the url to the PhotoBox");
        Ok(updated_res)
    }

    /// Removes a url from the PhotoBoxes.
    pub fn remove_url_from_photo_box(
        &self,
        id: &String,
        url: &String,
    ) -> Result<UpdateResult, Error> {
        let obj_id = match ObjectId::parse_str(id) {
            Ok(oid) => oid,
            Err(e) => return Err(Error::InvalidObjectId(e)),
        };
        let filter = doc! { "_id": obj_id };
        let update = doc! {
            "$pull": {
                "urls": url,
            }
        };
        let updated_res = self
            .photo_boxes_collection
            .update_one(filter, update, None)
            .expect("Error removing the url from the PhotoBox");
        Ok(updated_res)
    }

    /// Creates a user session.
    pub fn create_user_session(
        &self,
        user_id: &ObjectId,
        hash: &String,
    ) -> Result<InsertOneResult, Error> {
        let oid = ObjectId::new();
        let session = UserSession {
            _id: oid,
            user_id: *user_id,
            hash: hash.to_string(),
            created_at: oid.timestamp(),
        };

        let insert_result = self
            .user_sessions_collection
            .insert_one(session, None)
            .expect("Error creating the user session.");
        Ok(insert_result)
    }

    /// Gets the user session with the given hash.
    pub fn get_user_session_by_hash(&self, hash: &str) -> Result<UserSession, Error> {
        let find_one_result = self
            .user_sessions_collection
            .find_one(doc! {"hash": hash}, None)
            .expect("Error deleting the user session.")
            .unwrap();
        Ok(find_one_result)
    }

    /// Deletes the user session with the given hash.
    pub fn delete_user_session_by_hash(&self, hash: &str) -> Result<DeleteResult, Error> {
        let delete_result = self
            .user_sessions_collection
            .delete_one(doc! {"hash": hash}, None)
            .expect("Error deleting the user session.");
        Ok(delete_result)
    }

    /// Inserts a single SharedCollection.
    pub fn create_collection(
        &self,
        new_collection: SharedCollection,
    ) -> Result<InsertOneResult, Error> {
        let inserted_collection = self
            .shared_collections_collection
            .insert_one(new_collection, None)
            .expect("Error inserting the SharedCollection");
        Ok(inserted_collection)
    }

    /// Returns all SharedCollections.
    pub fn get_all_collections(&self) -> Result<Vec<SharedCollection>, Error> {
        let collections_cursor = self
            .shared_collections_collection
            .find(None, None)
            .expect("Error getting all SharedCollection");
        let collections = collections_cursor.map(|doc| doc.unwrap()).collect();
        Ok(collections)
    }

    /// Returns a single SharedCollection identified by its hash.
    pub fn get_collection_by_hash(&self, hash: &String) -> Result<SharedCollection, Error> {
        let filter = doc! { "hash": hash };
        let found_collection = self
            .shared_collections_collection
            .find_one(filter, None)
            .expect("Error getting the SharedCollection.")
            .unwrap();
        Ok(found_collection)
    }
}
