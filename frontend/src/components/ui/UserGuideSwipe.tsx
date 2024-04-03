import React from "react";
import SwipeableViews from "react-swipeable-views";
import Image from "next/image";
const styles = {
  slide: {
    padding: 15,
    minHeight: 180,
    color: "#fff",
  },
  slide1: {
    margin: "auto",
    backgroundColor: "#ffda96",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  imageSlide: {
    margin: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

const userGuide = [
  "/userGuide/carousel-1.jpg",
  "/userGuide/carousel-2.jpg",
  "/userGuide/carousel-3.jpg",
  "/userGuide/carousel-4.jpg",
  "/userGuide/carousel-5.jpg",
  "/userGuide/carousel-6.jpg",
];

const UserGuideSwipe = () => (
  <div className="flex justify-center w-1/3" style={{ marginLeft: "470px" }}>
    <SwipeableViews enableMouseEvents style={{}}>
      <div style={Object.assign({}, styles.slide, styles.slide1)}>
        <p className="text-black">
          swip left to see how to use <strong>symbiont</strong>
        </p>
      </div>
      {userGuide.map((image, index) => (
        <div key={index} style={Object.assign({}, styles.imageSlide)}>
          <Image src={image} width={200} height={200} alt={image} />{" "}
        </div>
      ))}
    </SwipeableViews>
  </div>
);

export default UserGuideSwipe;
