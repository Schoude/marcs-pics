use crate::handlers::auth::SESSION_COOKIE_NAME;
use base64::decode;
use rocket::{
    http::Status,
    request::{FromRequest, Outcome, Request},
};

#[derive(Debug)]
/// Route guard to check if the user making the request is authorized by a session cookie.
/// TODO: find the associated session in the DB.
/// The problem now is that I don't have access to the managed global `MongoORM` to check that the session is in the DB.
pub struct HasSession;

#[derive(Debug)]
pub enum HasSessionError {
    CookieMissing,
    CookieDecodeError,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for HasSession {
    type Error = HasSessionError;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let cookie = match request.cookies().get(SESSION_COOKIE_NAME) {
            Some(c) => c,
            None => {
                return Outcome::Failure((Status::Unauthorized, HasSessionError::CookieMissing))
            }
        };

        let hash = cookie.value();
        match decode(hash) {
            Ok(_) => Outcome::Success(HasSession),
            Err(_) => Outcome::Failure((Status::Unauthorized, HasSessionError::CookieDecodeError)),
        }
    }
}
