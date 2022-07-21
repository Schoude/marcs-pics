extern crate dotenv;
use crate::models::user::{User, UserFound};
use dotenv::dotenv;
use mongodb::{
    bson::{doc, extjson::de::Error, oid::ObjectId},
    options::FindOneOptions,
    results::InsertOneResult,
    sync::{Client, Collection},
};
use std::env;

const DB_NAME: &str = "marcs_pics";
const USER_COLLECTION_NAME: &str = "users";

/// Wrapper around the MongoDB client with all collections.
pub struct MongoORM {
    user_collection: Collection<User>,
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

        MongoORM { user_collection }
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
    pub fn get_user_by_id(&self, id: String) -> Result<UserFound, Error> {
        let obj_id = match ObjectId::parse_str(id) {
            Ok(oid) => oid,
            Err(_) => panic!("Error parsing the id"),
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
}
