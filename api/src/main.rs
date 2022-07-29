mod db;
mod guards;
mod handlers;
mod models;
mod utils;

#[macro_use]
extern crate rocket;

use db::mongodb::MongoORM;
use handlers::{
    auth::{login, logout, me},
    photo_box::{add_photo_box, get_all_photo_boxes, get_photo_box_by_id, update_photo_box},
    upload::upload_image,
    user::{add_user, delete_user_by_id, get_all_users, get_user_by_id, update_nickname_or_email},
};
use rocket::{
    fs::{relative, FileServer, NamedFile},
    http::Status,
    serde::json::{json, Json, Value},
};
use std::path::Path;

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

/// Redirects all not found routes to the root `index.html`
#[get("/<_..>", rank = 3)]
async fn fallback() -> Option<NamedFile> {
    NamedFile::open(Path::new("site/").join("index.html"))
        .await
        .ok()
}

/// Add this route after the static file server router to have SPA fallback
/// that redirects all unmatched routes to the SPA's index.html.
// #[get("/<_..>", rank = 2)]
// async fn spa_fallback() -> Option<NamedFile> {
//     NamedFile::open(Path::new("static/").join("index.html"))
//         .await
//         .ok()
// }

#[launch]
fn rocket() -> _ {
    let db = MongoORM::init();

    rocket::build()
        // auth routes
        .mount(API_BASE, routes![login, logout, me])
        .mount(API_BASE, routes![hello_world, hello,])
        // User endpoints
        .mount(
            API_BASE,
            routes![
                add_user,
                get_user_by_id,
                update_nickname_or_email,
                delete_user_by_id,
                get_all_users,
            ],
        )
        // PhotoBox endpoints
        .mount(
            API_BASE,
            routes![
                add_photo_box,
                get_all_photo_boxes,
                update_photo_box,
                get_photo_box_by_id,
                upload_image,
            ],
        )
        .register(API_BASE, catchers!(not_found))
        .manage(db)
        .mount("/", FileServer::from(relative!("site")).rank(1))
        // serves the uploaded files for the photo-boxes
        .mount("/storage", FileServer::from(relative!("storage")).rank(2))
        // rank = 3
        .mount("/", routes![fallback])
    // uncomment these lines to have a static files server
    // with SPA fallback for unmatched files that redirect to the root index.html
    // .mount("/", FileServer::from(relative!("static")).rank(1))
    // .mount("/", routes![spa_fallback])
}
