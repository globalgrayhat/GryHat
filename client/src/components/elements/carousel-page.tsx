import { Carousel, Typography, Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";

type SlideItem = {
  type: "image" | "video";
  src: string;
  alt?: string;
  title: string;
  description: string;
  primaryAction: { label: string; to: string };
  secondaryAction?: { label: string; to: string };
};

const slides: SlideItem[] = [
  {
    type: "video",
    src: "https://ik.imagekit.io/lusgev0eyt/mrRobot.mp4",
    alt: "GrayHat",
    title: "Welcome to GrayHat",
    description:
      "Unlock your full potential with expert-led cybersecurity training and real-world simulations.",
    primaryAction: { label: "Start Learning", to: "/courses" },
    secondaryAction: { label: "Testimonials", to: "#" },
  },
];

export default function CarouselComponent() {
  return (
    <Carousel
      className="rounded-none h-[30rem] md:h-[40rem] bg-black/20"
      autoplay
      autoplayDelay={7000}
      loop
    >
      {slides.map(({ type, src, alt, title, description, primaryAction, secondaryAction }, index) => (
        <div key={index} className="relative h-full w-full">
          {type === "image" ? (
            <img src={src} alt={alt} className="h-full w-full object-cover" />
          ) : (
            <video
              src={src}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white px-8 md:px-16 lg:px-32">
              <Typography
                variant="h1"
                color="white"
                className="mb-4 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight"
              >
                {title}
              </Typography>
              <Typography
                variant="lead"
                color="white"
                className="mb-8 opacity-90 text-lg md:text-xl lg:text-2xl"
              >
                {description}
              </Typography>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link to={primaryAction.to}>
                  <Button
                    size="lg"
                    color="white"
                    className="text-black bg-white hover:bg-gray-200"
                  >
                    {primaryAction.label}
                  </Button>
                </Link>
                {secondaryAction && (
                  <Link to={secondaryAction.to}>
                    <Button size="lg" color="white" variant="text">
                      {secondaryAction.label}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  );
}
