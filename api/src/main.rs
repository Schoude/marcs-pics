mod db;
mod handlers;
mod models;

#[macro_use]
extern crate rocket;

use db::mongodb::MongoORM;
use handlers::user::{add_user, delete_user_by_id, get_user_by_id, update_nickname_or_email};
use rocket::{
    http::Status,
    serde::json::{json, Json, Value},
};

const API_BASE: &str = "/api";

#[get("/")]
fn hello_world() -> &'static str {
    "Hello World"
}

#[get("/hello")]
fn hello() -> Result<Json<String>, Status> {
    Ok(Json(String::from("Hello from Rust with MongoDB!")))
}

/// API route not found catcher that returns a plain JSON response.
#[catch(404)]
fn not_found() -> Value {
    json!({
        "status": "error",
        "reason": "Resource was not found."
    })
}

#[launch]
fn rocket() -> _ {
    let db = MongoORM::init();

    rocket::build()
        .mount(API_BASE, routes![hello_world, hello,])
        // User endpoints
        .mount(
            API_BASE,
            routes![
                add_user,
                get_user_by_id,
                update_nickname_or_email,
                delete_user_by_id
            ],
        )
        .register(API_BASE, catchers!(not_found))
        .manage(db)
}
