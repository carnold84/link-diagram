import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input
} from "@angular/core";
import * as THREE from "three";
import * as d3 from "d3";

@Component({
  selector: "app-link-diagram",
  templateUrl: "./link-diagram.component.html",
  styleUrls: ["./link-diagram.component.scss"]
})
export class LinkDiagramComponent implements AfterViewInit {
  @Input() data;
  @Input() styles = {
    bgColor: "#ffffff",
    link: {
      bgColor: "",
      lineColor: "#eeeeee"
    },
    node: {
      bgColor: "#cccccc",
      lineColor: ""
    }
  };

  @ViewChild("canvas", undefined)
  private canvasRef: ElementRef;

  private camera: THREE.PerspectiveCamera;
  private height: number;
  private links: Array<any> = [];
  private nodes: Array<any> = [];
  private renderer: THREE.WebGLRenderer;
  private simulation: any;
  private scene: THREE.Scene;
  private view: any;
  private width: number;

  ngAfterViewInit() {
    this.init();
    this.startRendering();
    this.startSimulation();
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private init = () => {
    this.height = this.canvas.clientHeight;
    this.width = this.canvas.clientWidth;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.styles.bgColor);

    this.camera = new THREE.PerspectiveCamera();

    this.camera.position.set(0, 0, 400);
    this.camera.lookAt(0, 0, 0);

    const light = new THREE.PointLight(0xffffff, 1, 1000);
    light.position.set(0, 0, 100);
    this.scene.add(light);

    const loader = new THREE.FontLoader();

    loader.load("assets/helvetiker_regular.typeface.json", font => {
      this.data.links.forEach(element => {
        const link = this.createLink(element);
        this.scene.add(link);
        this.links.push(link);
      });

      this.data.nodes.forEach(element => {
        const node = this.createNode(element, font);
        this.scene.add(node);
        this.nodes.push(node);
      });
    });
  };

  private startSimulation = () => {
    const { links, nodes } = this.data;

    this.simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id))
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    this.simulation.on("tick", this.update);
  };

  private update = () => {
    this.links.forEach((link, i) => {
      const linkData = this.data.links[i];

      const sourceVertice = link.geometry.vertices[0];
      sourceVertice.x = linkData.source.x;
      sourceVertice.y = linkData.source.y;

      const targetVertice = link.geometry.vertices[1];
      targetVertice.x = linkData.target.x;
      targetVertice.y = linkData.target.y;

      link.geometry.verticesNeedUpdate = true;
    });

    this.nodes.forEach((node, i) => {
      const nodeData = this.data.nodes[i];

      node.position.x = nodeData.x;
      node.position.y = nodeData.y;
    });
  };

  private createLink = data => {
    const geometry = new THREE.Geometry();
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(this.styles.link.lineColor)
    });
    geometry.vertices.push(new THREE.Vector3(data.source.x, data.source.y, 0));
    geometry.vertices.push(new THREE.Vector3(data.target.x, data.target.y, 0));
    const line = new THREE.Line(geometry, material);

    return line;
  };

  private createNode = (data, font) => {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.styles.node.bgColor)
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = 0;
    sphere.position.y = 0;

    const textGeometry = new THREE.TextGeometry(data.name, {
      font: font,
      size: 1,
      height: 0,
      curveSegments: 12
    });
    const text = new THREE.Mesh(textGeometry, material);
    text.position.x = 2;
    text.position.y = -0.5;

    const innerSphere = this.createSphere({
      color: this.styles.node.bgColor,
      opacity: 1,
      diameter: 1
    });
    const outerSphere = this.createSphere({
      color: this.styles.node.lineColor,
      opacity: 0.25,
      diameter: 1.25
    });

    let node = new THREE.Group();
    node.add(innerSphere);
    node.add(outerSphere);
    node.add(text);
    node.position.x = data.x;
    node.position.y = data.y;

    return node;
  };

  private createSphere = ({ color, opacity, diameter }) => {
    const geometry = new THREE.SphereGeometry(diameter, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      opacity,
      transparent: true
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = 0;
    sphere.position.y = 0;

    return sphere;
  };

  private startRendering = () => {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.width, this.height);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.autoClear = true;

    const zoom = d3
      .zoom()
      .wheelDelta(function wheelDelta() {
        // make it zoom in on scroll up
        return (d3.event.deltaY * (d3.event.deltaMode ? 120 : 1)) / 500;
      })
      .scaleExtent([100, 400])
      .on("zoom", () => {
        const event = d3.event;

        if (event.sourceEvent) {
          // Get z from D3
          const newZ = event.transform.k;

          if (newZ !== this.camera.position.z) {
            // Handle a zoom event
            const { clientX, clientY } = event.sourceEvent;

            // Project a vector from current mouse position and zoom level
            // Find the x and y coordinates for where that vector intersects the new
            // zoom level.
            // Code from WestLangley https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z/13091694#13091694
            const vector = new THREE.Vector3(
              (clientX / this.width) * 2 - 1,
              -(clientY / this.height) * 2 + 1,
              1
            );
            vector.unproject(this.camera);
            const dir = vector.sub(this.camera.position).normalize();
            const distance = (newZ - this.camera.position.z) / dir.z;
            const pos = this.camera.position
              .clone()
              .add(dir.multiplyScalar(distance));

            // Set the camera to new coordinates
            this.camera.position.set(pos.x, pos.y, newZ);
          } else {
            // Handle panning
            const { movementX, movementY } = event.sourceEvent;

            // Adjust mouse movement by current scale and set camera
            const current_scale = this.getCurrentScale();
            this.camera.position.set(
              this.camera.position.x - movementX / current_scale,
              this.camera.position.y + movementY / current_scale,
              this.camera.position.z
            );
          }
        }
      });

    // Add zoom listener
    this.view = d3.select(this.renderer.domElement);
    this.view.call(zoom);

    // Disable double click to zoom because I'm not handling it in Three.js
    this.view.on("dblclick.zoom", null);

    // Sync d3 zoom with camera z position
    zoom.scaleTo(this.view, 10000);

    // start rendering
    requestAnimationFrame(this.render);
  };

  private getCurrentScale = () => {
    const vFOV = (this.camera.fov * Math.PI) / 180;
    const scale_height = 2 * Math.tan(vFOV / 2) * this.camera.position.z;
    const currentScale = this.height / scale_height;
    return currentScale;
  };

  private render = () => {
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
  };

  private onDocumentMouseDown = event => {
    console.log("onDocumentMouseDown", event);
    event.preventDefault();

    let mouse = new THREE.Vector2();
    mouse.x = (event.clientX / this.width) * 2 - 1;
    mouse.y = -(event.clientY / this.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    let INTERSECTED = undefined;

    raycaster.setFromCamera(mouse, this.camera);
    var intersects = raycaster.intersectObjects(this.scene.children);
    console.log(intersects);
    if (intersects.length > 0) {
      if (INTERSECTED != intersects[0].object) {
        if (INTERSECTED)
          INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        INTERSECTED = intersects[0].object;
        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        INTERSECTED.material.emissive.setHex(0xff0000);
      }
    } else {
      if (INTERSECTED)
        INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      INTERSECTED = null;
    }
  };
}
