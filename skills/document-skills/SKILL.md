---
name: document-skills
description: "Comprehensive document processing toolkit for working with office documents. Covers PDF manipulation (extraction, creation, merging, forms), Word documents (.docx) with tracked changes and redlining, PowerPoint presentations (.pptx), and Excel spreadsheets (.xlsx). Use this skill when Claude needs to create, read, edit, or convert office documents."
---

# Document Skills

A collection of skills for working with office document formats.

## Available Skills

### [PDF](./pdf/SKILL.md)

Full PDF processing toolkit:
- Extract text and tables from PDFs
- Create new PDFs with reportlab
- Merge, split, rotate pages
- Fill PDF forms
- OCR scanned documents
- Password protection

### [DOCX](./docx/SKILL.md)

Word document creation and editing:
- Create documents with docx-js
- Edit existing documents with OOXML manipulation
- Tracked changes and redlining workflow
- Comments and formatting preservation
- Convert to/from other formats with pandoc

### [PPTX](./pptx/SKILL.md)

PowerPoint presentation handling:
- Create new presentations
- Modify existing slides
- Work with layouts, speaker notes, and comments

### [XLSX](./xlsx/SKILL.md)

Spreadsheet creation and analysis:
- Create spreadsheets with formulas and formatting
- Read and analyze data
- Modify existing spreadsheets while preserving formulas
- Data analysis and visualization

## Choosing the Right Skill

| Task | Skill |
|------|-------|
| Read/extract from PDF | pdf |
| Fill a PDF form | pdf |
| Create a Word document | docx |
| Edit a Word document with tracked changes | docx |
| Create a presentation | pptx |
| Work with spreadsheet data | xlsx |
