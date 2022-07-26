use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum UserRole {
    Admin,
}

/// MongoDB document schema of a user.
///
/// Example document:
/// ```jsonc
/// {
///   "_id": ObjectId('9a895880-c891-426f-80dc-ed0094a1a455'),
///   "nickname": "Schoude",
///   "email": "marcbaque1311@gmail.com",
///
///   // brypted or hashed with more secure Argon2 algorithm
///   "pasword": "$2a$12$FCnvM1w4RjpL3X2ztKqA8ORAQdwnKDjZ7W5.BPxVO31SJtdFoR2Ri",
///
///   // enum UserRole
///   "role": "Admin"
/// }
/// ```
#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub nickname: String,
    pub email: String,
    pub password: String,
    pub role: UserRole,
}

/// Identical with `User` struct only missing the `password` field
/// and having the id formatted as `_id`.
/// This struct should be used for `Users` consumed by the frontend.
#[derive(Serialize, Deserialize)]
pub struct UserFound {
    pub _id: ObjectId,
    pub nickname: String,
    pub email: String,
    pub role: UserRole,
}

/// Used to update a User's nickname and email from a PUT request.
#[derive(Serialize, Deserialize)]
pub struct UserUpdate {
    pub nickname: String,
    pub email: String,
}

/// Gets returned as the auhorized user.
/// Also has the firebase config attached.
#[derive(Serialize, Deserialize)]
pub struct UserAuth {
    pub _id: ObjectId,
    pub nickname: String,
    pub email: String,
    pub role: UserRole,
}
