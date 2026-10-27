import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class TestFSDProject(unittest.TestCase):

    def test_index_html_exists(self):
        self.assertTrue((ROOT / "index.html").is_file())

    def test_jobs_html_exists(self):
        self.assertTrue((ROOT / "jobs.html").is_file())

    def test_login_html_exists(self):
        self.assertTrue((ROOT / "login.html").is_file())

    def test_register_html_exists(self):
        self.assertTrue((ROOT / "register.html").is_file())

    def test_job_details_html_exists(self):
        self.assertTrue((ROOT / "job-details.html").is_file())

    def test_dashboard_html_exists(self):
        self.assertTrue((ROOT / "dashboard.html").is_file())

    def test_about_html_exists(self):
        self.assertTrue((ROOT / "about.html").is_file())

    def test_contact_html_exists(self):
        self.assertTrue((ROOT / "contact.html").is_file())

    def test_style_css_exists(self):
        self.assertTrue((ROOT / "css" / "style.css").is_file())

    def test_responsive_css_exists(self):
        self.assertTrue((ROOT / "css" / "responsive.css").is_file())

    def test_main_js_exists(self):
        self.assertTrue((ROOT / "js" / "main.js").is_file())

    def test_api_js_exists(self):
        self.assertTrue((ROOT / "js" / "api.js").is_file())

    def test_backend_server_exists(self):
        self.assertTrue((ROOT / "backend" / "server.js").is_file())

    def test_backend_auth_lib_exists(self):
        self.assertTrue((ROOT / "backend" / "lib" / "auth.js").is_file())

    def test_backend_store_lib_exists(self):
        self.assertTrue((ROOT / "backend" / "lib" / "store.js").is_file())

    def test_index_contains_html(self):
        content = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("<html", content.lower())


if __name__ == "__main__":
    unittest.main()
