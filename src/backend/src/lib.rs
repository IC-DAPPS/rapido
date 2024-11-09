#[ic_cdk_macros::query]
pub fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

#[test]
fn generate_candid() {
    candid::export_service!();

    std::fs::write("../distributed/backend/backend.did", __export_service())
        .expect("Failed to write backend.did");
}
