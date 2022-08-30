import { HomeIcon, MapIcon, UsersIcon, HeartIcon, DesktopComputerIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import { StyledSidebar } from '.'
import { selectUser } from '../../../../redux/user'
import { Item } from './Item'

const Sidebar: FC = () => {
  const user = useSelector(selectUser)

  return (
    <StyledSidebar>
      <div className="sidebarItemGrid">
        <Item 
          text="Home"
          icon={<HomeIcon />}
          route="/"
        />

        <Item 
          text="My Maps"
          icon={<MapIcon />}
          route="/my-maps"
        />

        <Item 
          text="Friends"
          icon={<UsersIcon />}
          route="/friends"
        />

        <Item 
          text="Liked Maps"
          icon={<HeartIcon />}
          route="/liked"
        />
 
        <Item 
          text="Ongoing Games"
          icon={<DesktopComputerIcon />}
          route="/ongoing"
        />
      </div>

      <div className="quickLinksSection">
        <div className="title">
          <span>Quick Play</span>
        </div>

        <div className="quickLinkItemWrapper">
          <Link href="/aerial">
            <a className="linkItem">
              <span>Aerial</span>
            </a>
          </Link>
          
          <div className="linkItem">
            <span>Classic Game</span>
          </div>

          <div className="linkItem">
            <span>Challenges</span>
          </div>

          <Link href="/bingo">
            <a className="linkItem">
              <span>Geo-Bingo</span>
            </a>
          </Link>

          <Link href="/puzzles">
            <a className="linkItem">
              <span>Puzzles</span>
            </a>
          </Link>    
        </div>
      </div>

      {/* <div className="quickLinksSection">
        <div className="title">
          <span>Learn</span>
        </div>

        <div className="quickLinkItemWrapper">
          <div className="linkItem">
            <span>Capitals</span>
          </div>

          <div className="linkItem">
            <span>Flags</span>
          </div>

          <div className="linkItem">
            <span>History</span>
          </div>

          <div className="linkItem">
            <span>License Plates</span>
          </div>

          <div className="linkItem">
            <span>Languages</span>
          </div>
        </div>
      </div>  */}

      {user.isAdmin && (
        <div className="quickLinksSection">
          <div className="title">
            <span>Admin</span>
          </div>

          <div className="quickLinkItemWrapper">
            <Link href="/admin/analytics">
              <a className="linkItem">
                <span>Analytics</span>
              </a>
            </Link>    
          </div>
        </div> 
      )}
    </StyledSidebar>
  )
}

export default Sidebar