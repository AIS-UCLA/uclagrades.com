import { useEffect, useState } from "react";
import { CourseRow } from "../types";
import untypedSubjectIndex from "../generated/subject-index.json";

type SubjectIndex = {
  [subjectArea: string]: {
    [catalogNumber: string]: CourseRow[];
  };
};

const subjectIndex = untypedSubjectIndex as SubjectIndex;

function useCourseData(subjectArea: string, catalogNumber: string) {
  const [courseData, setCourseData] = useState<CourseRow[]>([]);

  useEffect(() => {
    // Get data directly from the JSON instead of making an API call
    try {
      const data = subjectIndex[subjectArea.toUpperCase()]?.[catalogNumber.toUpperCase()] || [];
      setCourseData(data);
    } catch (error) {
      console.error("Failed to load course data:", error);
      setCourseData([]);
    }
  }, [subjectArea, catalogNumber]);

  return { courseData };
}

export default useCourseData;
