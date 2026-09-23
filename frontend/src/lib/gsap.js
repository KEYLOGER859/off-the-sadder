import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);
gsap.defaults({ ease: "expo.out", duration: 1 });

export { gsap, Draggable };
