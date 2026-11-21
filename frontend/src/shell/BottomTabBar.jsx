import { NavLink } from 'react-router-dom';
import { TAB_ITEMS } from './navigation';

/**
 * BottomTabBar — the phone navigation.
 *
 * A floating frosted pill (Liquid Glass L3) inset from the screen edges and
 * lifted above the home indicator. It is deliberately not a "shrunk sidebar":
 * icons + short labels only, one clear active state, and a blurred backdrop on
 * every platform that supports it.
 */

const BottomTabBar = () => (
  <nav className="tabbar glass--float" aria-label="Navigation principale">
    {TAB_ITEMS.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `tabbar__item${isActive ? ' is-active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <span className="tabbar__glow" aria-hidden="true" />
              <Icon className="tabbar__icon" aria-hidden="true" />
              <span className="tabbar__label">{item.label}</span>
              {isActive && <span className="sr-only">(page active)</span>}
            </>
          )}
        </NavLink>
      );
    })}
  </nav>
);

export default BottomTabBar;
