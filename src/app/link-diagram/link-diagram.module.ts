import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LinkDiagramComponent } from "./components/link-diagram/link-diagram.component";

@NgModule({
  declarations: [LinkDiagramComponent],
  exports: [LinkDiagramComponent],
  imports: [CommonModule]
})
export class LinkDiagramModule {}
