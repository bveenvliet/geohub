import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC } from 'react'
import { Avatar, FlexGroup } from '@components/System'
import { ChartBarIcon } from '@heroicons/react/outline'
import { LightningBoltIcon } from '@heroicons/react/solid'
import { useAppSelector } from '@redux/hook'
import { MapLeaderboardType } from '@types'
import { formatLargeNumber, formatRoundTime } from '@utils/helperFunctions'
import { StyledLeaderboardItem } from './'

type Props = {
  finishPlace: number
  row: MapLeaderboardType
}

const LeaderboardItem: FC<Props> = ({ finishPlace, row }) => {
  const router = useRouter()
  const user = useAppSelector((state) => state.user)

  const LAST_PLACE = 6

  // If we are on the profile page of this user, show their avatar in redux
  // this allows it to update immediately after editing profile
  const isProfilePage = router.asPath.includes('user')
  const isThisUsersProfile = router.query?.id === user.id

  return (
    <StyledLeaderboardItem highlight={!!row.highlight}>
      <div className="user-section">
        <span className="user-place">{finishPlace === LAST_PLACE && row.highlight ? '' : `#${finishPlace}`}</span>
        <div className="user-info">
          {isProfilePage && isThisUsersProfile ? (
            <Avatar type="user" src={user.avatar.emoji} backgroundColor={user.avatar.color} />
          ) : (
            <Avatar type="user" src={row.userAvatar.emoji} backgroundColor={row.userAvatar.color} />
          )}
          <Link href={`/user/${row.userId}`}>
            <a className="username-wrapper">
              <span className="username">{row.userName}</span>
            </a>
          </Link>
        </div>
      </div>

      <div className="results-section">
        {typeof row.totalPoints !== 'undefined' && (
          <span className="total-points">{formatLargeNumber(row.totalPoints)} points</span>
        )}

        {row.streak && (
          <div className="best-streak-wrapper">
            <LightningBoltIcon />
            <span className="best-streak">{row.streak}</span>
          </div>
        )}

        <FlexGroup gap={5}>
          {row.totalTime && <span className="total-time">{formatRoundTime(row.totalTime)}</span>}

          <Link href={`/results/${row._id}`}>
            <a className="results-link">
              <ChartBarIcon />
            </a>
          </Link>
        </FlexGroup>
      </div>
    </StyledLeaderboardItem>
  )
}

export default LeaderboardItem
