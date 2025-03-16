import { addDays, isBefore } from "date-fns";
import { useEffect, useState } from "react";
import { mapValues, pick } from "lodash";
import untypedSubjectIndex from "../generated/subject-index.json";
import untypedInstructorIndex from "../generated/instructor-index.json";
import { BaseCourseRow, CourseRow } from "../types";

// Define types similar to the API route types
type SubjectIndex = {
  [subjectArea: string]: {
    [catalogNumber: string]: CourseRow[];
  };
};

type InstructorIndex = {
  [instructorName: string]: CourseRow[];
};

type CatalogNumbersBySubjectArea = {
  [subjectArea: string]: {
    [catalogNumber: string]: BaseCourseRow & {
      nRows: number;
    };
  };
};

type CoursesByInstructor = {
  [instructor: string]: {
    [subjectArea: string]: {
      [catalogNumber: string]: BaseCourseRow & {
        nRows: number;
      };
    };
  };
};

const subjectIndex = untypedSubjectIndex as SubjectIndex;
const instructorIndex = untypedInstructorIndex as InstructorIndex;

// Process courses data in the same way the API does
function processCourses(): CatalogNumbersBySubjectArea {
  const catalogNumbersBySubjectArea: CatalogNumbersBySubjectArea = {};
  const subjectAreas = Object.keys(subjectIndex);
  
  for (const subjectArea of subjectAreas) {
    catalogNumbersBySubjectArea[subjectArea] = mapValues(
      subjectIndex[subjectArea],
      (rows, key) => {
        return {
          subjectArea,
          ...pick(rows[0], "courseTitle"),
          catalogNumber: key,
          nRows: rows.length,
        };
      },
    );
  }
  
  return catalogNumbersBySubjectArea;
}

// Process instructors data in the same way the API does
function processInstructors(): CoursesByInstructor {
  const coursesByInstructor: CoursesByInstructor = {};
  const instructors = Object.keys(instructorIndex);
  
  for (const instructor of instructors) {
    if (!coursesByInstructor[instructor]) {
      coursesByInstructor[instructor] = {};
    }
    for (const course of instructorIndex[instructor]) {
      const { subjectArea } = course;
      if (!coursesByInstructor[instructor][subjectArea]) {
        coursesByInstructor[instructor][subjectArea] = {};
      }
      if (!coursesByInstructor[instructor][subjectArea][course.catalogNumber]) {
        coursesByInstructor[instructor][subjectArea][course.catalogNumber] = {
          subjectArea,
          courseTitle: course.courseTitle,
          catalogNumber: course.catalogNumber,
          nRows: 1,
        };
      } else {
        coursesByInstructor[instructor][subjectArea][
          course.catalogNumber
        ].nRows += 1;
      }
    }
  }
  
  return coursesByInstructor;
}

function useCourses() {
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courses, setCourses] = useState<CatalogNumbersBySubjectArea>();
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(true);
  const [instructors, setInstructors] = useState<CoursesByInstructor>();

  useEffect(() => {
    const cachedCourses = typeof window !== 'undefined' ? window.localStorage?.getItem("courses") : null;
    const cachedCoursesExpiration = new Date(
      typeof window !== 'undefined' ? window.localStorage?.getItem("courses-expiration") ?? 0 : 0
    );
    const now = new Date();
    
    if (cachedCourses && isBefore(now, cachedCoursesExpiration)) {
      setCourses(JSON.parse(cachedCourses));
      setIsLoadingCourses(false);
    } else {
      try {
        // Process data directly instead of fetching
        const processedCourses = processCourses();
        setCourses(processedCourses);
        
        // Still use localStorage for caching if available
        if (typeof window !== 'undefined') {
          window.localStorage.setItem("courses", JSON.stringify(processedCourses));
          window.localStorage.setItem(
            "courses-expiration",
            addDays(now, 1).toISOString(),
          );
        }
      } catch (error) {
        console.error("Failed to process courses data:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    }
  }, []);

  useEffect(() => {
    const cachedInstructors = typeof window !== 'undefined' ? window.localStorage?.getItem("instructors") : null;
    const cachedInstructorsExpiration = new Date(
      typeof window !== 'undefined' ? window.localStorage?.getItem("instructors-expiration") ?? 0 : 0
    );
    const now = new Date();
    
    if (cachedInstructors && isBefore(now, cachedInstructorsExpiration)) {
      setInstructors(JSON.parse(cachedInstructors));
      setIsLoadingInstructors(false);
    } else {
      try {
        // Process data directly instead of fetching
        const processedInstructors = processInstructors();
        setInstructors(processedInstructors);
        
        // Still use localStorage for caching if available
        if (typeof window !== 'undefined') {
          window.localStorage.setItem("instructors", JSON.stringify(processedInstructors));
          window.localStorage.setItem(
            "instructors-expiration",
            addDays(now, 1).toISOString(),
          );
        }
      } catch (error) {
        console.error("Failed to process instructors data:", error);
      } finally {
        setIsLoadingInstructors(false);
      }
    }
  }, []);

  const isLoading = isLoadingCourses || isLoadingInstructors;
  return { courses, instructors, isLoading };
}

export default useCourses;
