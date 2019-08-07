import * as THREE from "three";

export const createLink = (data, styles) => {
  const geometry = new THREE.Geometry();
  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(styles.link.lineColor)
  });
  geometry.vertices.push(
    new THREE.Vector3(data.source.x, data.source.y, 0),
    new THREE.Vector3(data.target.x, data.target.y, 0)
  );
  const line = new THREE.Line(geometry, material);

  return line;
};

export const createNode = (data, font, styles) => {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(styles.node.bgColor)
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

  const innerSphere = createSphere({
    color: styles.node.bgColor,
    opacity: 1,
    diameter: 1
  });

  const outerSphere = createSphere({
    color: styles.node.lineColor,
    opacity: 0.25,
    diameter: 1.75
  });

  let node = new THREE.Group();
  node.add(innerSphere);
  node.add(outerSphere);
  node.add(text);
  node.position.x = data.x;
  node.position.y = data.y;

  return node;
};

const createSphere = ({ color, opacity, diameter }) => {
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
