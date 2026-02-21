import { describe, it, expect } from "vitest";
import DOMPurify from "dompurify";

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','div','span','strong','em','b','i','br','ul','ol','li','table','thead','tbody','tr','th','td','img','style'],
  ALLOWED_ATTR: ['style','class','data-pdf-section','src','alt','dir'],
  ALLOW_DATA_ATTR: true,
};

describe("PDF DOMPurify Sanitization", () => {
  it("preserves safe HTML content", () => {
    const input = '<div style="color:red;"><strong>Hello</strong> <em>World</em></div>';
    const result = DOMPurify.sanitize(input, PURIFY_CONFIG);
    expect(result).toContain("<strong>Hello</strong>");
    expect(result).toContain("<em>World</em>");
  });

  it("preserves data-pdf-section attributes", () => {
    const input = '<div data-pdf-section style="padding:10px;">Content</div>';
    const result = DOMPurify.sanitize(input, PURIFY_CONFIG);
    expect(result).toContain("data-pdf-section");
  });

  it("strips script tags", () => {
    const input = '<div>Safe</div><script>alert("xss")</script>';
    const result = DOMPurify.sanitize(input, PURIFY_CONFIG);
    expect(result).not.toContain("<script>");
    expect(result).toContain("Safe");
  });

  it("strips onerror handlers from img tags", () => {
    const input = '<img src="x" onerror="alert(1)" alt="test">';
    const result = DOMPurify.sanitize(input, PURIFY_CONFIG);
    expect(result).not.toContain("onerror");
    expect(result).toContain('alt="test"');
  });

  it("strips onclick handlers", () => {
    const input = '<div onclick="alert(1)">Click me</div>';
    const result = DOMPurify.sanitize(input, PURIFY_CONFIG);
    expect(result).not.toContain("onclick");
    expect(result).toContain("Click me");
  });

  it("preserves markdown-converted HTML structure", () => {
    const input = `
      <h2 style="font-size:17px;font-weight:700;color:#ec4899;">Title</h2>
      <div style="padding:3px 0 3px 16px;"><span style="width:6px;height:6px;background:#ec4899;border-radius:50%;"></span>Item 1</div>
      <div style="height:10px;"></div>
      <p>Paragraph text</p>
    `;
    const result = DOMPurify.sanitize(input, PURIFY_CONFIG);
    expect(result).toContain("<h2");
    expect(result).toContain("Title");
    expect(result).toContain("Item 1");
    expect(result).toContain("Paragraph text");
  });

  it("preserves img with valid src", () => {
    const input = '<img src="data:image/png;base64,abc123" style="width:40px;" alt="logo">';
    const result = DOMPurify.sanitize(input, PURIFY_CONFIG);
    expect(result).toContain("src=");
    expect(result).toContain('alt="logo"');
  });
});
