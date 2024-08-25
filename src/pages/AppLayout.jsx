import SideBar from "../components/Sidebar"
import Map from "../components/Map" 
import styles from "./AppLayout.module.css"
import User from "../components/User"
function AppLayout() {
    return (
        <div className={styles.app}>
            <SideBar/>
            <Map />
            <User />
        </div>
    )
}

export default AppLayout