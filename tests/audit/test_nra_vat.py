"""
Comprehensive 32-Point Statutory Audit Test Suite for NRA Bulgarian VAT & GFO Compliance.
Testing Ordinance H-12, Windows-1251 encoding, CRLF formatting, Mod 11 EIK algorithms,
EU VIES validation, 3-way mathematical ledger reconciliation, and Commercial Register GFO XML.
"""

import os
import tempfile
import unittest
import xml.etree.ElementTree as ET

from src.accounting.gfo_generator import (
    CompanyEntityProfile,
    GFOGeneratorEngine,
)
from src.audit.nra_vat_reporter import (
    NRAVATDeclaration,
    NRAVATReporter,
    VATPeriod,
    validate_eik,
    validate_vies_vat,
)


class TestNRAVATComplianceAudit(unittest.TestCase):
    """32 Statutory Audit Tests for NRA Bulgarian VAT & GFO Compliance."""

    def setUp(self):
        self.sample_period = VATPeriod(year=2026, month=1)
        self.sample_decl = NRAVATDeclaration(
            eik="207849182",
            company_name="ОПЪН БАЛАНСЪР ЕООД",
            vat_period=self.sample_period,
            taxable_base_20=278176.22,
            vat_tax_20=55635.24,
            purchases_taxable_base_20=276545.30,
            purchases_vat_credit_20=55309.06,
            previous_vat_to_deduct=0.0,
        )

        self.sample_purchases = [
            {
                "doc_num": "0000102941",
                "doc_date": "2026-01-05",
                "supplier_eik": "121302211",
                "supplier_name": "ОМВ БЪЛГАРИЯ ООД",
                "doc_type": "01",
                "base_amount": 125000.00,
                "vat_amount": 25000.00,
                "credit_type": "FULL",
            },
            {
                "doc_num": "0000492811",
                "doc_date": "2026-01-12",
                "supplier_eik": "131456985",
                "supplier_name": "АЕН БЪЛГАРИЯ ЕООД",
                "doc_type": "01",
                "base_amount": 100000.00,
                "vat_amount": 20000.00,
                "credit_type": "FULL",
            },
            {
                "doc_num": "0000847291",
                "doc_date": "2026-01-22",
                "supplier_eik": "831641791",
                "supplier_name": "ВИВАКОМ БЪЛГАРИЯ ЕАД",
                "doc_type": "01",
                "base_amount": 51545.30,
                "vat_amount": 10309.06,
                "credit_type": "FULL",
            },
        ]

        self.sample_sales = [
            {
                "doc_num": "0000000841",
                "doc_date": "2026-01-08",
                "client_eik": "824009827",
                "client_name": "СТОРОГОЗИЯ АД",
                "doc_type": "01",
                "base_amount": 150000.00,
                "vat_amount": 30000.00,
                "vat_rate": "20",
            },
            {
                "doc_num": "0000000842",
                "doc_date": "2026-01-18",
                "client_eik": "114077876",
                "client_name": "СТОРГОЗИЯ АД",
                "doc_type": "01",
                "base_amount": 128176.22,
                "vat_amount": 25635.24,
                "vat_rate": "20",
            },
        ]

    # 1. Mod 11 Valid 9-digit EIK
    def test_01_mod11_valid_9_digit_eik(self):
        valid_eiks = ["207849182", "121302211", "824009827", "131456985", "831641791", "114077876"]
        for eik in valid_eiks:
            self.assertTrue(validate_eik(eik), f"EIK {eik} should be valid Mod 11")

    # 2. Mod 11 Valid 13-digit EIK
    def test_02_mod11_valid_13_digit_eik(self):
        test_13 = "1213022110017"
        self.assertTrue(validate_eik(test_13), f"13-digit EIK {test_13} should be valid")

    # 3. Mod 11 Invalid Checksum Rejected
    def test_03_mod11_invalid_checksum_rejected(self):
        invalid_eiks = ["207849180", "121302210", "824009821", "000000001"]
        for eik in invalid_eiks:
            self.assertFalse(validate_eik(eik), f"EIK {eik} with invalid checksum should be rejected")

    # 4. Mod 11 Non-digit or Wrong Length Rejected
    def test_04_mod11_non_digit_rejected(self):
        self.assertFalse(validate_eik("20784918A"))
        self.assertFalse(validate_eik("12345"))
        self.assertFalse(validate_eik(""))
        self.assertFalse(validate_eik("123456789012345"))

    # 5. Mod 11 Second Round Weight Validation
    def test_05_mod11_second_round_weight_validation(self):
        self.assertTrue(validate_eik("207849182"))
        self.assertTrue(validate_eik("121302211"))

    # 6. EU VIES VAT Format - Bulgaria
    def test_06_vies_vat_number_format_bulgaria(self):
        self.assertTrue(validate_vies_vat("BG207849182"))
        self.assertTrue(validate_vies_vat("BG121302211"))

    # 7. EU VIES VAT Format - Germany
    def test_07_vies_vat_number_format_germany(self):
        self.assertTrue(validate_vies_vat("DE123456789"))

    # 8. EU VIES VAT Format - France
    def test_08_vies_vat_number_format_france(self):
        self.assertTrue(validate_vies_vat("FR12345678901"))
        self.assertTrue(validate_vies_vat("FRXX123456789"))

    # 9. EU VIES VAT Format - Netherlands
    def test_09_vies_vat_number_format_netherlands(self):
        self.assertTrue(validate_vies_vat("NL123456789B01"))

    # 10. EU VIES VAT Invalid Non-EU Prefix
    def test_10_vies_vat_number_invalid_prefix(self):
        self.assertFalse(validate_vies_vat("US123456789"))
        self.assertFalse(validate_vies_vat("1234"))
        self.assertFalse(validate_vies_vat(""))

    # 11. VAT Period Parsing and Formatting
    def test_11_vat_period_parsing_and_formatting(self):
        p1 = VATPeriod.from_str("2026-01")
        self.assertEqual(p1.year, 2026)
        self.assertEqual(p1.month, 1)
        self.assertEqual(p1.period_str, "202601")
        self.assertEqual(p1.period_display, "01.2026")

        p2 = VATPeriod.from_str("202612")
        self.assertEqual(p2.year, 2026)
        self.assertEqual(p2.month, 12)
        self.assertEqual(p2.period_str, "202612")

    # 12. VAT Period Invalid Format Raises ValueError
    def test_12_vat_period_invalid_format_raises(self):
        with self.assertRaises(ValueError):
            VATPeriod.from_str("invalid-date")
        with self.assertRaises(ValueError):
            VATPeriod.from_str("2026")

    # 13. VAT Declaration Net Payable (Cell 50)
    def test_13_vat_declaration_net_payable_cell50(self):
        decl = NRAVATDeclaration(
            eik="207849182",
            company_name="ОПЪН БАЛАНСЪР ЕООД",
            vat_period=self.sample_period,
            taxable_base_20=10000.00,
            vat_tax_20=2000.00,
            purchases_taxable_base_20=6000.00,
            purchases_vat_credit_20=1200.00,
        )
        self.assertEqual(decl.net_vat_payable, 800.00)
        self.assertEqual(decl.net_vat_refundable, 0.00)

    # 14. VAT Declaration Net Refundable (Cell 60)
    def test_14_vat_declaration_net_refundable_cell60(self):
        decl = NRAVATDeclaration(
            eik="207849182",
            company_name="ОПЪН БАЛАНСЪР ЕООД",
            vat_period=self.sample_period,
            taxable_base_20=5000.00,
            vat_tax_20=1000.00,
            purchases_taxable_base_20=10000.00,
            purchases_vat_credit_20=2000.00,
        )
        self.assertEqual(decl.net_vat_payable, 0.00)
        self.assertEqual(decl.net_vat_refundable, 1000.00)

    # 15. VAT Declaration Zero Balance Equality
    def test_15_vat_declaration_zero_balance_equality(self):
        decl = NRAVATDeclaration(
            eik="207849182",
            company_name="ОПЪН БАЛАНСЪР ЕООД",
            vat_period=self.sample_period,
            taxable_base_20=10000.00,
            vat_tax_20=2000.00,
            purchases_taxable_base_20=10000.00,
            purchases_vat_credit_20=2000.00,
        )
        self.assertEqual(decl.net_vat_payable, 0.00)
        self.assertEqual(decl.net_vat_refundable, 0.00)

    # 16. Effective Tax with Previous Deduction (Cell 70)
    def test_16_vat_declaration_effective_tax_with_deduction_cell70(self):
        decl = NRAVATDeclaration(
            eik="207849182",
            company_name="ОПЪН БАЛАНСЪР ЕООД",
            vat_period=self.sample_period,
            taxable_base_20=10000.00,
            vat_tax_20=2000.00,
            purchases_taxable_base_20=5000.00,
            purchases_vat_credit_20=1000.00,
            previous_vat_to_deduct=300.00,
        )
        self.assertEqual(decl.net_vat_payable, 1000.00)
        self.assertEqual(decl.effective_vat_to_pay, 700.00)

    # 17. DEKLAR.TXT Structure and Cell Mapping
    def test_17_deklar_txt_structure_and_cell_mapping(self):
        txt = NRAVATReporter.generate_declar_txt(self.sample_decl)
        self.assertIn("HEADER|DEKLAR|202601|EIK:207849182|ОПЪН БАЛАНСЪР ЕООД", txt)
        self.assertIn("CELL01-01|202601", txt)
        self.assertIn("CELL11|278176.22", txt)
        self.assertIn("CELL21|55635.24", txt)
        self.assertIn("CELL31|276545.30", txt)
        self.assertIn("CELL41|55309.06", txt)
        self.assertIn("CELL50|326.18", txt)
        self.assertIn("CELL60|0.00", txt)
        self.assertIn("FOOTER|DEKLAR|END", txt)

    # 18. DEKLAR.TXT Encoding is Windows-1251 Compatible
    def test_18_deklar_txt_encoding_is_cp1251(self):
        txt = NRAVATReporter.generate_declar_txt(self.sample_decl)
        encoded_bytes = txt.encode("windows-1251")
        decoded = encoded_bytes.decode("windows-1251")
        self.assertEqual(txt, decoded)

    # 19. DEKLAR.TXT CRLF Line Endings
    def test_19_deklar_txt_crlf_line_endings(self):
        txt = NRAVATReporter.generate_declar_txt(self.sample_decl)
        self.assertIn("\r\n", txt)
        lines = txt.split("\r\n")
        self.assertTrue(len(lines) >= 8)

    # 20. POKUPKI.TXT Generation and Headers
    def test_20_pokupki_txt_generation_and_headers(self):
        txt = NRAVATReporter.generate_pokupki_txt(self.sample_decl, self.sample_purchases)
        self.assertIn("HEADER|POKUPKI|202601|EIK:207849182", txt)
        self.assertIn("FOOTER|POKUPKI|END", txt)

    # 21. POKUPKI.TXT Item Line Formatting per Ordinance H-12
    def test_21_pokupki_txt_item_line_formatting(self):
        txt = NRAVATReporter.generate_pokupki_txt(self.sample_decl, self.sample_purchases)
        self.assertIn("1|01|0000102941|2026-01-05|121302211|ОМВ БЪЛГАРИЯ ООД|125000.00|25000.00|FULL", txt)
        self.assertIn("2|01|0000492811|2026-01-12|131456985|АЕН БЪЛГАРИЯ ЕООД|100000.00|20000.00|FULL", txt)

    # 22. POKUPKI.TXT Supplier Validation
    def test_22_pokupki_txt_supplier_validation(self):
        for item in self.sample_purchases:
            self.assertTrue(validate_eik(item["supplier_eik"]))

    # 23. PRODAGBI.TXT Generation and Headers
    def test_23_prodagbi_txt_generation_and_headers(self):
        txt = NRAVATReporter.generate_prodagbi_txt(self.sample_decl, self.sample_sales)
        self.assertIn("HEADER|PRODAGBI|202601|EIK:207849182", txt)
        self.assertIn("FOOTER|PRODAGBI|END", txt)

    # 24. PRODAGBI.TXT Item Line Formatting per Ordinance H-12
    def test_24_prodagbi_txt_item_line_formatting(self):
        txt = NRAVATReporter.generate_prodagbi_txt(self.sample_decl, self.sample_sales)
        self.assertIn("1|01|0000000841|2026-01-08|824009827|СТОРОГОЗИЯ АД|150000.00|30000.00|20%", txt)
        self.assertIn("2|01|0000000842|2026-01-18|114077876|СТОРГОЗИЯ АД|128176.22|25635.24|20%", txt)

    # 25. PRODAGBI.TXT Client Validation
    def test_25_prodagbi_txt_client_validation(self):
        for item in self.sample_sales:
            self.assertTrue(validate_eik(item["client_eik"]))

    # 26. Triplet Mathematical Reconciliation - Exact Match
    def test_26_triplet_mathematical_reconciliation_exact_match(self):
        dec_txt = NRAVATReporter.generate_declar_txt(self.sample_decl)
        pok_txt = NRAVATReporter.generate_pokupki_txt(self.sample_decl, self.sample_purchases)
        prd_txt = NRAVATReporter.generate_prodagbi_txt(self.sample_decl, self.sample_sales)

        recon = NRAVATReporter.reconcile_vat_triplet(dec_txt, pok_txt, prd_txt)
        self.assertTrue(recon["is_reconciled"])
        self.assertEqual(recon["discrepancy"], 0.00)
        self.assertEqual(recon["sales_vat_total"], 55635.24)
        self.assertEqual(recon["purchases_vat_total"], 55309.06)
        self.assertEqual(recon["calculated_net_payable"], 326.18)

    # 27. Triplet Reconciliation Detects Discrepancy
    def test_27_triplet_reconciliation_detects_discrepancy(self):
        dec_txt = NRAVATReporter.generate_declar_txt(self.sample_decl)
        mismatch_purchases = [
            {
                "doc_num": "0000102941",
                "doc_date": "2026-01-05",
                "supplier_eik": "121302211",
                "supplier_name": "ОМВ БЪЛГАРИЯ ООД",
                "doc_type": "01",
                "base_amount": 100000.00,
                "vat_amount": 20000.00,
                "credit_type": "FULL",
            }
        ]
        pok_txt = NRAVATReporter.generate_pokupki_txt(self.sample_decl, mismatch_purchases)
        prd_txt = NRAVATReporter.generate_prodagbi_txt(self.sample_decl, self.sample_sales)

        recon = NRAVATReporter.reconcile_vat_triplet(dec_txt, pok_txt, prd_txt)
        self.assertFalse(recon["is_reconciled"])
        self.assertGreater(recon["discrepancy"], 0.00)

    # 28. Microinvest Delta Baseline - 278,176.22 BGN Turnover
    def test_28_triplet_microinvest_delta_baseline_278k_turnover(self):
        res = NRAVATReporter.generate_monthly_vat_package(period="2026-01")
        self.assertEqual(res["total_turnover_bgn"], 278176.22)
        self.assertEqual(res["declaration"].taxable_base_20, 278176.22)

    # 29. Microinvest Delta VAT Liability - 326.18 BGN Payable
    def test_29_triplet_microinvest_delta_vat_liability_326_18_bgn(self):
        res = NRAVATReporter.generate_monthly_vat_package(period="2026-01")
        self.assertEqual(res["net_vat_payable_bgn"], 326.18)
        self.assertEqual(res["declaration"].net_vat_payable, 326.18)
        self.assertTrue(res["reconciliation"]["is_reconciled"])

    # 30. Export Package Creates Windows-1251 Encoded Files with CRLF
    def test_30_export_vat_package_creates_cp1251_files_with_crlf(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            res = NRAVATReporter.export_vat_package(
                self.sample_decl, self.sample_purchases, self.sample_sales, output_dir=tmpdir
            )

            for key in ["DEKLAR", "POKUPKI", "PRODAGBI"]:
                fpath = res[key]
                self.assertTrue(os.path.exists(fpath))
                with open(fpath, "rb") as f:
                    raw_bytes = f.read()
                    self.assertFalse(raw_bytes.startswith(b"\xef\xbb\xbf"))
                    self.assertIn(b"\r\n", raw_bytes)
                    decoded = raw_bytes.decode("windows-1251")
                    self.assertTrue(len(decoded) > 0)

    # 31. GFO Commercial Register XML Export and Statutory Reconciliation
    def test_31_gfo_commercial_register_xml_export_and_reconciliation(self):
        profile = CompanyEntityProfile(
            company_name="ОПЪН БАЛАНСЪР ЕООД",
            eik="207849182",
            address="гр. София, бул. Цариградско шосе 115",
            manager_name="Валентин Атанасов",
            accounting_standard="NAS",
        )

        # Balanced trial balance where Assets = Liabilities + Equity
        # Total Revenues = 200,000, Total Expenses = 100,000 => Profit before tax = 100,000, Tax = 10,000, Net Profit = 90,000
        # Assets: 204 (50,000) - 241 (10,000) = 40,000 net tangible; 411 (60,000); 503 (40,000) => Total Assets = 140,000
        # Liabilities & Equity: 101 (20,000); 121 (10,000); 123 Net Profit (90,000) => Equity = 120,000; 401 Trade payables (20,000) => Total = 140,000
        trial_balance = {
            "101": {"final_credit": 20000.00, "initial_credit": 20000.00},
            "121": {"final_credit": 10000.00, "initial_credit": 10000.00},
            "204": {"final_debit": 50000.00, "debit_turnover": 0.0},
            "241": {"final_credit": 10000.00},
            "411": {"final_debit": 60000.00, "credit_turnover": 200000.00},
            "503": {"final_debit": 40000.00, "initial_debit": 10000.00},
            "401": {"final_credit": 20000.00, "debit_turnover": 100000.00},
            "702": {"credit_turnover": 200000.00, "debit_turnover": 60000.00},
            "602": {"debit_turnover": 20000.00},
            "604": {"debit_turnover": 20000.00},
        }

        report = GFOGeneratorEngine.generate_gfo(profile, trial_balance, 2025)
        val = GFOGeneratorEngine.validate_gfo(report)
        self.assertTrue(val.is_valid, f"GFO validation errors: {val.validation_errors}")

        xml_str = GFOGeneratorEngine.export_commercial_register_xml(report)
        root = ET.fromstring(xml_str)
        self.assertEqual(root.tag, "{urn:bg:registryagency:gfo:v1}GFOReport")
        self.assertIn("ОПЪН БАЛАНСЪР ЕООД", xml_str)
        self.assertIn("207849182", xml_str)

    # 32. Full Autonomous Monthly VAT and GFO E2E Pipeline
    def test_32_full_nra_vat_and_gfo_end_to_end_audit_pipeline(self):
        vat_res = NRAVATReporter.generate_monthly_vat_package(period="2026-01")
        self.assertEqual(vat_res["net_vat_payable_bgn"], 326.18)
        self.assertEqual(vat_res["total_turnover_bgn"], 278176.22)
        self.assertTrue(vat_res["reconciliation"]["is_reconciled"])
        self.assertTrue(all(vat_res["eik_validations"].values()))

        # Check export files exist
        for key in ["DEKLAR", "POKUPKI", "PRODAGBI"]:
            self.assertTrue(os.path.exists(vat_res["export_paths"][key]))


if __name__ == "__main__":
    unittest.main()
