extern crate dotenv;
use crate::models::user::User;
use dotenv::dotenv;
use mongodb::{
    bson::extjson::de::Error,
    results::InsertOneResult,
    sync::{Client, Collection},
};
use std::env;

const DB_NAME: &str = "marcs_pics";
const USER_COLLECTION_NAME: &str = "users";

pub struct MongoORM {
    user_collection: Collection<User>,
}

impl MongoORM {
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

    pub fn create_user(&self, new_user: User) -> Result<InsertOneResult, Error> {
        let inserted_user = self
            .user_collection
            .insert_one(new_user, None)
            .expect("Error creating user in DB.");

        Ok(inserted_user)
    }
}
