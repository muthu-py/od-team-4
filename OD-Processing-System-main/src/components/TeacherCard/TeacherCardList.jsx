import React from 'react';
import TeacherCard from './TeacherCard';

const TeacherCardList = ({ teachers }) => {
    return (
        <div className="teacher-card-list">
            {teachers.map(teacher => (
                <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
        </div>
    );
};

export default TeacherCardList;
