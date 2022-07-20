mod handlers;
mod models;

use handlers::user::add_user;
use rocket::{
    http::Status,
    serde::json::{json, Json, Value},
};

#[macro_use]
extern crate rocket;

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
    rocket::build()
        .mount(API_BASE, routes![hello_world, hello, add_user])
        .register(API_BASE, catchers!(not_found))
}
