import  DateTimePicker  from '../../components/form/DateTimePicker'
import Form from '../../components/form/Form'
import Navbar from '../../components/common/Navbar'
import StudentReport from '../../components/form/StudentReport';

export default function StudentHome() {
    return (
        <>
            <Box sx={{ mb: 4 }}>
                <StudentReport />
            </Box>
        </>
    )
}