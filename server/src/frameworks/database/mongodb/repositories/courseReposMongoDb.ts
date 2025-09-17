import Course from '../models/course';
<<<<<<< HEAD
import mongoose, { Types } from 'mongoose';
=======
import mongoose from 'mongoose';
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
import Students from '../models/student';
import {
  AddCourseInfoInterface,
  EditCourseInfo,
  CourseInterface
} from '@src/types/courseInterface';

export const courseRepositoryMongodb = () => {
  const addCourse = async (courseInfo: AddCourseInfoInterface) => {
<<<<<<< HEAD
      const normalized: any = { ...courseInfo };
  if (!normalized.category && normalized.categoryId) normalized.category = normalized.categoryId;
  if (!normalized.about) normalized.about = normalized.description || normalized.title || 'About';
const newCourse = new Course(normalized);
=======
    const newCourse = new Course(courseInfo);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    newCourse.price ? (newCourse.isPaid = true) : (newCourse.isPaid = false);
    const { _id: courseId } = await newCourse.save();
    return courseId;
  };

  const editCourse = async (courseId: string, editInfo: EditCourseInfo) => {
    const response = await Course.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(courseId) },
      { ...editInfo }
<<<<<<< HEAD
    )
    .populate('instructorId', 'firstName lastName email profilePic')
    ;
=======
    );
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    return response;
  };

  const getAllCourse = async () => {
<<<<<<< HEAD
    const courses: CourseInterface[] | null = await Course.find({})
    .populate('instructorId', 'firstName lastName email profilePic')
    .populate('category', 'name');
=======
    const courses: CourseInterface[] | null = await Course.find({});
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    return courses;
  };

  const getCourseById = async (courseId: string) => {
    const course: CourseInterface | null = await Course.findOne({
      _id: new mongoose.Types.ObjectId(courseId)
<<<<<<< HEAD
    })
    .populate('instructorId', 'firstName lastName email profilePic')
    .populate('category', 'name') 
    .populate('subcategory', 'name')
    .lean();
=======
    }).lean();
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    return course;
  };

  const getCourseByInstructorId = async (instructorId: string) => {
    const courses = await Course.find({
      instructorId: new mongoose.Types.ObjectId(instructorId)
    });
    return courses;
  };

  const getAmountByCourseId = async (courseId: string) => {
    const amount = await Course.findOne(
      { _id: new mongoose.Types.ObjectId(courseId) },
      { price: 1 }
    );
    return amount;
  };

  const enrollStudent = async (courseId: string, studentId: string) => {
    const response = await Course.updateOne(
      { _id: new mongoose.Types.ObjectId(courseId) },
      { $push: { coursesEnrolled: studentId } }
    );
    return response;
  };

<<<<<<< HEAD
  // Get recommended courses based on student interests
  const getRecommendedCourseByStudentInterest = async (studentId: string) => {
    const pipeline = [
      { $match: { _id: new Types.ObjectId(studentId) } },
=======
  const getRecommendedCourseByStudentInterest = async (studentId: string) => {
    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(studentId) } },
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
      { $unwind: '$interests' },
      {
        $lookup: {
          from: 'categories',
          localField: 'interests',
          foreignField: 'name',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $lookup: {
          from: 'course',
<<<<<<< HEAD
          localField: 'category._id',
=======
          localField: 'category.name',
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
          foreignField: 'category',
          as: 'courses'
        }
      },
      { $unwind: '$courses' },
<<<<<<< HEAD
  
      // Lookup instructor
      {
        $lookup: {
          from: 'users',
=======
      {
        $lookup: {
          from: 'instructor',
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
          localField: 'courses.instructorId',
          foreignField: '_id',
          as: 'instructor'
        }
      },
<<<<<<< HEAD
      { $unwind: '$instructor' },
  
      // Lookup reviews
      {
        $lookup: {
          from: 'reviews',
          localField: 'courses._id',
          foreignField: 'courseId',
          as: 'reviews'
        }
      },
  
      // Add rating average
      {
        $addFields: {
          'courses.rating': { $avg: '$reviews.rating' }
        }
      },
  
      // Merge instructor into course
      {
        $addFields: {
          'courses.instructor': '$instructor'
        }
      },
  
      // Final projection
      {
        $project: {
          _id: '$courses._id',
          title: '$courses.title',
          duration: '$courses.duration',
          level: '$courses.level',
          thumbnailUrl: '$courses.thumbnail.url',
          enrolledCount: { $size: { $ifNull: ['$courses.coursesEnrolled', []] } },
          rating: { $ifNull: ['$courses.rating', 0] },
          price: {
            $cond: {
              if: { $eq: ['$courses.isPaid', false] },
              then: 0,
              else: '$courses.price'
            }
          },
          instructorFirstName: '$courses.instructor.firstName',
          instructorLastName: '$courses.instructor.lastName',
          instructorProfileUrl: '$courses.instructor.profilePic.url',
          categoryName: '$category.name',
          createdAt: {
            $dateToString: {
              format: '%Y/%m/%d',
              date: '$courses.createdAt',
              timezone: 'UTC'
            }
=======
      {
        $addFields: {
          instructor: { $arrayElemAt: ['$instructor', 0] }
        }
      },
      {
        $project: {
          course: {
            _id: '$courses._id',
            name: '$courses.title',
            thumbnailKey: '$courses.thumbnail.key'
          },
          instructor: {
            _id: '$instructor._id',
            firstName: '$instructor.firstName',
            lastName: '$instructor.lastName',
            email: '$instructor.email',
            profileKey: '$instructor.profilePic.key'
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
          }
        }
      }
    ];
<<<<<<< HEAD
  
    const courses = await Students.aggregate(pipeline);
    return courses;
  };
  
  const getTrendingCourses = async () => {
    const now = new Date();
  
    const courses = await Course.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'courseId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          enrolledCount: { $size: { $ifNull: ['$coursesEnrolled', []] } },
          rating: { $avg: '$reviews.rating' },
          daysSinceCreated: {
            $divide: [
              { $subtract: [now, '$createdAt'] },
              1000 * 60 * 60 * 24 // milliseconds to days
            ]
          }
        }
      },
      {
        $addFields: {
          status: {
            $switch: {
              branches: [
                {
                  case: { $lt: ['$daysSinceCreated', 5] },
                  then: 'new'
                },
                {
                  case: {
                    $and: [
                      { $gte: ['$daysSinceCreated', 5] },
                      { $lte: ['$daysSinceCreated', 15] },
                      { $gte: ['$enrolledCount', 10] } // You can adjust this threshold
                    ]
                  },
                  then: 'hot'
                },
                {
                  case: { $gt: ['$daysSinceCreated', 15] },
                  then: 'trending'
                }
              ],
              default: 'none'
            }
          }
        }
      },
      { $sort: { enrolledCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
=======
    const courses = await Students.aggregate(pipeline);
    return courses;
  };

  const getTrendingCourses = async () => {
    const courses = await Course.aggregate([
      {
        $sort: { enrolledCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'instructor',
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
          localField: 'instructorId',
          foreignField: '_id',
          as: 'instructor'
        }
      },
      {
<<<<<<< HEAD
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$instructor' },
      { $unwind: '$category' },
      {
        $project: {
          _id: 1,
          title: 1,
          duration: 1,
          level: 1,
          rating: { $ifNull: ['$rating', 0] },
          enrolledCount: 1,
          price: {
            $cond: {
              if: { $eq: ['$isPaid', false] },
              then: 0,
              else: '$price'
            }
          },
          thumbnail: 1,
          thumbnailUrl: '$thumbnail.url',
          instructorFirstName: '$instructor.firstName',
          instructorLastName: '$instructor.lastName',
          instructorProfileUrl: '$instructor.profilePic.url',
          categoryName: '$category.name',
          createdAt: {
            $dateToString: { format: '%Y/%m/%d', date: '$createdAt' }
          },
          status: 1 // Return status: 'new', 'hot', 'trending'
        }
      }
    ]);
  
    return courses;
  };
  
=======
        $project: {
          title: '$title',
          coursesEnrolled: '$coursesEnrolled',
          thumbnail: '$thumbnail',
          instructorFirstName: { $arrayElemAt: ['$instructor.firstName', 0] },
          instructorLastName: { $arrayElemAt: ['$instructor.lastName', 0] },
          instructorProfile: { $arrayElemAt: ['$instructor.profilePic', 0] },
          profileUrl: ''
        }
      }
    ]);
    return courses;
  };

>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  const getCourseByStudent = async (id: string) => {
    const courses: CourseInterface[] | null = await Course.find({
      coursesEnrolled: {
        $in: [new mongoose.Types.ObjectId(id)]
      }
    });
    return courses;
  };

  const getTotalNumberOfCourses = async () => {
    const totalCourses = await Course.find().count();
    return totalCourses;
  };

  const getNumberOfCoursesAddedInEachMonth = async () => {
    const courseCountsByMonth = await Course.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: {
          month: 1
        }
      }
    ]);
    return courseCountsByMonth;
  };

  const getStudentsByCourseForInstructor = async (instructorId: string) => {
    const students = await Course.aggregate([
      {
        $match: { instructorId: new mongoose.Types.ObjectId(instructorId) }
      },
      {
        $unwind: '$coursesEnrolled'
      },
      {
        $lookup: {
          from: 'students',
          localField: 'coursesEnrolled',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $project: {
          student: { $arrayElemAt: ['$studentDetails', 0] },
          courseName: '$title'
        }
      },
      {
        $group: {
          _id: '$student._id',
          course: { $first: '$courseName' },
          firstName: { $first: '$student.firstName' },
          lastName: { $first: '$student.lastName' },
          email: { $first: '$student.email' },
          mobile: { $first: '$student.mobile' },
          dateJoined: { $first: '$student.dateJoined' },
          isBlocked: { $first: '$student.isBlocked' },
          profilePic: { $first: '$student.profilePic' },
          isGoogleUser: { $first: '$student.isGoogleUser' }
        }
      }
    ]);
    return students;
  };

  const searchCourse = async (
    isFree: boolean,
    searchQuery: string,
    filterQuery: string
  ) => {
    let query = {};
    if (searchQuery && filterQuery) {
      query = {
        $and: [{ $text: { $search: searchQuery } }, { isFree: isFree }]
      };
    } else if (searchQuery) {
      query = { $text: { $search: searchQuery } };
    } else if (filterQuery) {
      query = { isFree: isFree };
    }
    const courses = await Course.find(query, {
      score: { $meta: 'textScore' }
    }).sort({ score: { $meta: 'textScore' } });

    return courses;
  };

<<<<<<< HEAD
  const deleteCourse = async (courseId: string) => {
    const response = await Course.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(courseId)
    });
    return response;
  };
  

=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  return {
    addCourse,
    editCourse,
    getAllCourse,
    getCourseById,
    getCourseByInstructorId,
    getAmountByCourseId,
    enrollStudent,
    getRecommendedCourseByStudentInterest,
    getTrendingCourses,
    getCourseByStudent,
    getTotalNumberOfCourses,
    getNumberOfCoursesAddedInEachMonth,
    getStudentsByCourseForInstructor,
<<<<<<< HEAD
    searchCourse,
    deleteCourse
=======
    searchCourse
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  };
};

export type CourseRepositoryMongoDbInterface = typeof courseRepositoryMongodb;
