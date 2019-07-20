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

  @ViewChild("canvas", undefined)
  private canvasRef: ElementRef;
  public isPanning: boolean = false;

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private cameraTarget: THREE.Vector3;
  private scene: THREE.Scene;

  private simulation;

  private nodes: Array<THREE.Mesh> = [];

  ngAfterViewInit() {
    this.init();
    this.startRendering();
    this.startSimulation();
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private init = () => {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxesHelper(200));

    this.camera = new THREE.PerspectiveCamera();
    /* this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 100; */

    this.camera.position.set(0, 0, 400);
    this.camera.up.set(0, 0, -1);
    this.camera.lookAt(0, 0, 0);

    var light = new THREE.PointLight(0xffffff, 1, 1000);
    light.position.set(0, 0, 100);
    this.scene.add(light);

    this.data.nodes.forEach(element => {
      const node = this.createNode(element);
      this.scene.add(node);
      this.nodes.push(node);
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
    this.nodes.forEach((node, i) => {
      node.position.x = this.data.nodes[i].x;
      node.position.y = this.data.nodes[i].y;
    });

    this.renderer.render(this.scene, this.camera);
  };

  private createNode = data => {
    const geometry = new THREE.SphereGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = data.x;
    sphere.position.y = data.y;

    return sphere;
  };

  private startRendering = () => {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.autoClear = true;

    requestAnimationFrame(this.render);
  };

  private render = () => {
    this.renderer.render(this.scene, this.camera);
  };

  public onMouseDown = evt => {
    console.log(evt, "onMouseDown");
    this.isPanning = true;
  };

  public onMouseUp = evt => {
    console.log(evt, "onMouseUp");
    this.isPanning = false;
  };

  public onMouseMove = evt => {
    console.log(evt, "onMouseMove");
  };

  public onMouseWheel = evt => {
    console.log(evt, "onMouseWheel");
  };
}
