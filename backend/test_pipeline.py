import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import unittest
try:
    from backend.services.sample_generator import generate_sample_excels
    from backend.services.excel_parser import parse_road_excel, parse_drainage_excel, parse_water_excel
    from backend.services.validator import validate_road_data, validate_drainage_data, validate_water_data
    from backend.services.calculator import compute_road_stats, compute_drainage_stats, compute_water_stats
    from backend.services.chart_generator import generate_road_chart, generate_drainage_charts, generate_water_chart
    from backend.services.ppt_generator import build_ppt_presentation
except ImportError:
    from services.sample_generator import generate_sample_excels
    from services.excel_parser import parse_road_excel, parse_drainage_excel, parse_water_excel
    from services.validator import validate_road_data, validate_drainage_data, validate_water_data
    from services.calculator import compute_road_stats, compute_drainage_stats, compute_water_stats
    from services.chart_generator import generate_road_chart, generate_drainage_charts, generate_water_chart
    from services.ppt_generator import build_ppt_presentation

class TestCCRSReportPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_dir = Path("./test_tmp")
        cls.test_dir.mkdir(exist_ok=True)
        cls.sample_files = generate_sample_excels(cls.test_dir)

    def test_01_sample_parsing(self):
        road_rows = parse_road_excel(str(self.sample_files["road"]))
        self.assertGreater(len(road_rows), 0)
        
        drainage_rows = parse_drainage_excel(str(self.sample_files["drainage"]))
        self.assertGreater(len(drainage_rows), 0)

        water_rows = parse_water_excel(str(self.sample_files["water"]))
        self.assertGreater(len(water_rows), 0)

    def test_02_validation_math(self):
        road_rows = parse_road_excel(str(self.sample_files["road"]))
        v_road = validate_road_data(road_rows)
        self.assertEqual(len(v_road["warnings"]), 0)

        drainage_rows = parse_drainage_excel(str(self.sample_files["drainage"]))
        v_drainage = validate_drainage_data(drainage_rows)
        self.assertEqual(len(v_drainage["warnings"]), 0)

    def test_03_stats_calculation(self):
        road_rows = parse_road_excel(str(self.sample_files["road"]))
        v_road = validate_road_data(road_rows)
        road_stats = compute_road_stats(v_road["rows"])
        self.assertIn("grand_total", road_stats)
        self.assertEqual(road_stats["total_closed"] + road_stats["total_open"], road_stats["grand_total"])

        drainage_rows = parse_drainage_excel(str(self.sample_files["drainage"]))
        v_drainage = validate_drainage_data(drainage_rows)
        drainage_stats = compute_drainage_stats(v_drainage["rows"])
        self.assertEqual(drainage_stats["total_closed"] + drainage_stats["total_open"], drainage_stats["grand_total"])
        self.assertGreater(len(drainage_stats["insights"]), 0)

        water_rows = parse_water_excel(str(self.sample_files["water"]))
        v_water = validate_water_data(water_rows)
        water_stats = compute_water_stats(v_water["rows"])
        self.assertGreater(water_stats["total_open"], 0)
        self.assertGreater(len(water_stats["insights"]), 0)

    def test_04_ppt_generation(self):
        road_rows = parse_road_excel(str(self.sample_files["road"]))
        drainage_rows = parse_drainage_excel(str(self.sample_files["drainage"]))
        water_rows = parse_water_excel(str(self.sample_files["water"]))

        road_stats = compute_road_stats(validate_road_data(road_rows)["rows"])
        drainage_stats = compute_drainage_stats(validate_drainage_data(drainage_rows)["rows"])
        water_stats = compute_water_stats(validate_water_data(water_rows)["rows"])

        road_chart = generate_road_chart(road_stats, str(self.test_dir / "road.png"))
        drainage_charts = generate_drainage_charts(drainage_stats, str(self.test_dir))
        water_chart = generate_water_chart(water_stats, str(self.test_dir / "water.png"))

        chart_paths = {
            "road_chart": road_chart,
            "drainage_cat": drainage_charts["cat_breakdown"],
            "drainage_total": drainage_charts["total_volume"],
            "water_chart": water_chart
        }

        out_ppt = str(self.test_dir / "test_report.pptx")
        res = build_ppt_presentation(
            road_stats=road_stats,
            drainage_stats=drainage_stats,
            water_stats=water_stats,
            chart_paths=chart_paths,
            date_range="August 2026",
            output_ppt_path=out_ppt
        )
        self.assertTrue(Path(res).exists())

if __name__ == "__main__":
    unittest.main()
