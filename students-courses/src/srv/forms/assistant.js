const forms = require('server/forms');

forms.define({
    assistant: {
        overview: {
            text: 'Students & Courses is an academic workspace for courses, students and departments.',
            translations: {de: 'Students & Courses ist ein Arbeitsbereich für Kurse, Studierende und Fachbereiche.', bg: 'Students & Courses е учебна среда за курсове, студенти и катедри.'}
        },
        instructions: {
            'project.scope': 'Use the current Forms context. Explain available features without claiming that unsupported record edits or enrolment changes have been performed.'
        },
        skills: {
            'workspace.guide': {
                title: 'Workspace guide',
                description: 'Explain the workspace and navigate its available pages.',
                instructions: 'Refresh context_overview and gui_overview. Use visible page labels. Navigate only through discovered actions and verify their receipts.',
                requires: ['gui_overview', 'gui_invoke']
            }
        },
        modules: {
            courses: {
                overview: 'The Academics module connects students and courses to departments. Courses have a lifecycle status, delivery mode and participants; departments form a hierarchy.',
                instructions: {
                    'courses.terms': 'A department groups courses. Course status describes lifecycle; delivery mode describes how teaching is delivered. These are different concepts.'
                },
                skills: {
                    'courses.guide': {
                        title: 'Academic concepts',
                        description: 'Explain the difference between course lifecycle, teaching delivery and participation.',
                        instructions: 'Read the target scope before answering. Use lib/academic.js for reusable terminology helpers; it is a pure local library and does not change application data.',
                        files: {'lib/academic.js': 'export const concepts = () => ({status:"Course lifecycle",deliveryMode:"How teaching is delivered",participants:"Students enrolled in a course"});\n'}
                    }
                }
            }
        }
    }
});

forms.define({
    'courses.student': {
        assistant: function(details) {
            return {
                overview: 'Student directory and course participation.',
                instructions: {
                    'student.identity': 'Disambiguate students by visible identity; a name alone is not always unique.',
                    'context.mode': details.mode === 'collection' ? 'This is a student collection; no single student is selected by this context.' : 'This context describes one student. Keep its instructions local to this editor.'
                },
                skills: {'courses.student-guide': {title: 'Student context', description: 'Explain a student context and its course participation.', instructions: 'Use context_inspect for this student scope. A participation relation is a link to a course, not a copy of the student. Do not infer enrolment from a name match.'}}
            };
        }
    },
    'courses.course': {
        assistant: function(details) {
            return {
                overview: 'Course details: lifecycle, delivery mode, credits and participants.',
                instructions: {
                    'course.semantics': 'Credits describe the course workload. Participants are students linked to this course; never interpret the displayed participation count as the global student total.',
                    'context.mode': details.draft ? 'This editor has unsaved changes. Describe them as a draft, not persisted facts.' : 'Use current visible course state; do not invent missing values.'
                },
                skills: {'courses.course-guide': {title: 'Course context', description: 'Explain course fields without changing data.', instructions: 'Inspect this exact course scope. Explain lifecycle status separately from delivery mode. For reusable terminology, read the Academic concepts skill and import its returned lib/academic.js path.'}}
            };
        },
        properties: {
            participants: {
                assistant: {
                    instructions: {'participation.scope': 'This student collection belongs to the current course participants relation. Discuss only that relation, not all students in the workspace.'}
                }
            }
        }
    },
    'courses.department': {
        assistant: {
            overview: 'Departments organize courses in a parent/child hierarchy.',
            instructions: {'department.hierarchy': 'Distinguish direct department courses from a recursive selection including child departments.'}
        }
    }
});
