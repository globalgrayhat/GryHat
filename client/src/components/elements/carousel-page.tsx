import { Carousel, Typography, Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";

export default function CarouselComponent() {
  return (
    <Carousel
      className="rounded-none h-[30rem] md:h-[40rem] bg-black/20"
      autoplay={true}
      autoplayDelay={7000}
      loop={true}
    >
      {/* Slide 1 */}
      <div className="relative h-full w-full">
        <img
          src="https://res.cloudinary.com/dwucedjmy/image/upload/v1687722374/Tutor-Trek/09206fc2-d0f1-41f6-b714-36242be94ee7_zhgvax.jpg"
          alt="GrayHat Banner"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white px-8 md:px-16 lg:px-32">
            <Typography variant="h1" color="white" className="mb-4 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
              Welcome to GrayHat
            </Typography>
            <Typography variant="lead" color="white" className="mb-8 opacity-90 text-lg md:text-xl lg:text-2xl">
              Enhance your knowledge and skills with our comprehensive courses taught by expert instructors.
            </Typography>
            <div className="flex justify-center gap-4">
              <Link to="/courses">
                <Button size="lg" color="white" className="text-black bg-white hover:bg-gray-200">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" color="white" variant="text">
                  About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 2 */}
      <div className="relative h-full w-full">
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRlYWNoZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
          alt="Learn Anytime"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white px-8 md:px-16 lg:px-32">
            <Typography variant="h1" color="white" className="mb-4 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
              Learn Anytime, Anywhere
            </Typography>
            <Typography variant="lead" color="white" className="mb-8 opacity-90 text-lg md:text-xl lg:text-2xl">
              Access our courses from the comfort of your own home and learn at your own pace. No restrictions or time limits.
            </Typography>
            <div className="flex justify-center gap-4">
              <Link to="/courses">
                <Button size="lg" color="white" className="text-black bg-white hover:bg-gray-200">
                  Browse Courses
                </Button>
              </Link>
              <Link to="#">
                <Button size="lg" color="white" variant="text">
                  FAQs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 3 */}
      <div className="relative h-full w-full">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGxlYXJuaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
          alt="Expand Knowledge"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white px-8 md:px-16 lg:px-32">
            <Typography variant="h1" color="white" className="mb-4 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
              Expand Your Knowledge
            </Typography>
            <Typography variant="lead" color="white" className="mb-8 opacity-90 text-lg md:text-xl lg:text-2xl">
              Discover new subjects and gain expertise in your area of interest. Our platform offers a wide range of courses.
            </Typography>
            <div className="flex justify-center gap-4">
              <Link to="/courses">
                <Button size="lg" color="white" className="text-black bg-white hover:bg-gray-200">
                  Start Learning
                </Button>
              </Link>
              <Link to="#">
                <Button size="lg" color="white" variant="text">
                  Testimonials
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Carousel>
  );
}
