import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { LinkDiagramModule } from "./link-diagram/link-diagram.module";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, LinkDiagramModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
