import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { LinkDiagramComponent } from "./link-diagram.component";

describe("LinkDiagramComponent", () => {
  let component: LinkDiagramComponent;
  let fixture: ComponentFixture<LinkDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LinkDiagramComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
