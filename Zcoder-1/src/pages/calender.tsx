import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase'; // Adjust the path if necessary
import { contest } from '@/utils/types/problem'; // Ensure the path and type are correct
import Topbar from '@/components/Topbar/Topbar';

const ContestsPage = () => {
    const [currentContests, setCurrentContests] = useState<contest[]>([]);
    const [upcomingContests, setUpcomingContests] = useState<contest[]>([]);
    const [pastContests, setPastContests] = useState<contest[]>([]);
    const [isCurrentExpanded, setIsCurrentExpanded] = useState(false);
    const [isUpcomingExpanded, setIsUpcomingExpanded] = useState(false);
    const [isPastExpanded, setIsPastExpanded] = useState(false);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, "contests"));
                const now = Math.floor(Date.now() / 1000);
                const current: contest[] = [];
                const upcoming: contest[] = [];
                const past: contest[] = [];

                querySnapshot.forEach((doc) => {
                    const contest = doc.data() as contest;
                    if (contest.phase === 'BEFORE') {
                        upcoming.push(contest);
                    } else if (contest.phase === 'CODING' || contest.phase === 'PENDING_SYSTEM_TEST' || contest.phase === 'SYSTEM_TEST') {
                        current.push(contest);
                    } else if (contest.phase === 'FINISHED' || (contest.startTimeSeconds && contest.startTimeSeconds < now)) {
                        past.push(contest);
                    }
                });

                setCurrentContests(current);
                setUpcomingContests(upcoming);
                setPastContests(past);
            } catch (error) {
                console.error('Error fetching contests:', error);
            }
        };

        fetchContests();
    }, []);
    
    const renderContestList = (contests: contest[]) => (
        <ul className="space-y-4">
            {contests.map((contest) => (
                <li key={contest.id} className="p-4 bg-dark-layer-1 rounded-lg shadow-md">
                    <h3 className="text-lg text-gray-300 font-semibold">{contest.name}</h3>
                    <p className="text-gray-400">{contest.type}</p>
                    <p className="text-gray-400">
                        {contest.startTimeSeconds
                            ? new Date(contest.startTimeSeconds * 1000).toLocaleString()
                            : 'N/A'}
                    </p>
                </li>
            ))}
        </ul>
    );
    return (
        <>
            <main className="bg-dark-layer-2 min-h-screen">
                <Topbar />
                <h1 className="text-2xl text-center text-gray-700 dark:text-gray-400 font-medium uppercase mt-10 mb-5">
                    Contests Calendar
                </h1>
                <div className="relative overflow-x-auto mx-auto px-6 pb-10 max-w-[1200px] sm:w-7/12 w-full">
                    <div className="mb-4">
                        <div
                            className="bg-dark-layer-1 p-4 rounded-lg shadow-lg cursor-pointer"
                            onClick={() => setIsCurrentExpanded(!isCurrentExpanded)}
                        >
                            <h2 className="text-xl text-gray-300">Current Contests</h2>
                        </div>
                        {isCurrentExpanded && (
                            <div className="bg-dark-layer-1 p-4 rounded-lg shadow-lg mt-2">
                                {renderContestList(currentContests)}
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <div
                            className="bg-dark-layer-1 p-4 rounded-lg shadow-lg cursor-pointer"
                            onClick={() => setIsUpcomingExpanded(!isUpcomingExpanded)}
                        >
                            <h2 className="text-xl text-gray-300">Upcoming Contests</h2>
                        </div>
                        {isUpcomingExpanded && (
                            <div className="bg-dark-layer-1 p-4 rounded-lg shadow-lg mt-2">
                                {renderContestList(upcomingContests)}
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <div
                            className="bg-dark-layer-1 p-4 rounded-lg shadow-lg cursor-pointer"
                            onClick={() => setIsPastExpanded(!isPastExpanded)}
                        >
                            <h2 className="text-xl text-gray-300">Past Contests</h2>
                        </div>
                        {isPastExpanded && (
                            <div className="bg-dark-layer-1 p-4 rounded-lg shadow-lg mt-2">
                                {renderContestList(pastContests)}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default ContestsPage;
