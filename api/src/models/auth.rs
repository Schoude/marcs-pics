use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};

/// Credentials that the user has to send with the `POST` request to `/api/login`.
#[derive(Debug, Serialize, Deserialize)]
pub struct Credentials {
    pub email: String,
    pub password: String,
}

/// MongoDB schema for a User auth session.
#[derive(Serialize, Deserialize)]
pub struct UserSession {
    pub _id: ObjectId,
    pub user_id: ObjectId,
    pub hash: String,
    pub created_at: DateTime,
}
