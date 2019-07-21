import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  data;
  styles = {
    bgColor: "#04182A",
    link: {
      bgColor: "",
      lineColor: "#133C5C"
    },
    node: {
      bgColor: "#4B9FCC",
      lineColor: "#4B9FCC"
    }
  };

  ngOnInit() {
    const numNodes = 100;

    this.data = {
      links: [],
      nodes: []
    };

    for (let i = 0; i < numNodes; i++) {
      this.data.nodes.push({
        id: `node-${i + 1}`,
        name: `Node ${i + 1}`,
        value: Math.round(Math.random() * 1000)
      });
    }

    for (let j = 0; j < numNodes; j++) {
      const source = this.data.nodes[Math.round(Math.random() * (numNodes - 1))]
        .id;
      const target = this.data.nodes[Math.round(Math.random() * (numNodes - 1))]
        .id;

      if (target !== source) {
        this.data.links.push({
          id: `link-${j + 1}`,
          source,
          target
        });
      }
    }
  }
}
