"""Synthetic examples only. Never commit a student's transcript to this repository."""
from unittest.mock import patch
import pytest
from backend.academic import parse_transcript


TEXT = '''ACADEMIC RECORD
Transfered ECTS: 40
Semester:Spring 2024
55ACSC183 PROGRAMMING PRINCIPLES II 9,50 4,75/5
Cumulative ECTS: Cumulative GPA: 5
 5 5
Semester ECTS: Semester GPA: 45 9,50 9,50
Semester:Spring 2026
06ACSC330 INTERACTIVE DESIGN 0,30 0.00/6
Cumulative ECTS: Cumulative GPA: 0
 0 6
Semester ECTS: Semester GPA: 45 0,30 9,50
Issued: 23/10/2026'''


def synthetic_pdf(text=TEXT):
    class Page:
        def extract_text(self):
            return text
    class Reader:
        pages = [Page()]
    with patch('backend.academic.PdfReader', return_value=Reader()):
        return parse_transcript(b'%PDF-1.7 synthetic')


def test_valid_credits_and_failed_attempt():
    result=synthetic_pdf()
    assert result['earned_ects']==45
    assert result['transferred_ects']==40
    assert result['courses'][0]['status']=='Passed'
    assert result['courses'][1]['status']=='Failed'
    assert result['courses'][1]['attempted']==6
    assert result['courses'][1]['earned']==0
    assert len(result['history'])==2
    assert result['issued']=='2026-10-23'


def test_mismatched_cumulative_rejected():
    with pytest.raises(ValueError,match='reconcile'):
        synthetic_pdf(TEXT.replace('Semester GPA: 45 0,30','Semester GPA: 46 0,30'))


def test_rejects_non_pdf_and_unrecognized_layout():
    with pytest.raises(ValueError,match='PDF'):
        parse_transcript(b'not a pdf')
    with pytest.raises(ValueError,match='Academic Record'):
        synthetic_pdf('hello world')
