extern crate dotenv;
use crate::models::{
    photo_box::PhotoBox,
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

/// Wrapper around the MongoDB client with all collections.
pub struct MongoORM {
    user_collection: Collection<User>,
    photo_boxes_collection: Collection<PhotoBox>,
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

        MongoORM {
            user_collection,
            photo_boxes_collection,
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
}
