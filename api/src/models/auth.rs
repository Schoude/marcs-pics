use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

/// Credentials that the user has to send with the `POST` request to `/api/login`.
#[derive(Debug, Serialize, Deserialize)]
pub struct Credentials {
    pub email: String,
    pub password: String,
}

/// MongoDB schema for a User auth session.
#[derive(Serialize)]
pub struct UserSession {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: ObjectId,
    pub hash: String,
}
