import React from "react";
import { getCurrentPageUnfollowers, getMaxPage, getUsersForDisplay, isWithoutProfilePicture, SortBy } from "../utils/utils";
import { State } from "../model/state";
import { UserNode } from "../model/user";
import { Timings } from "../model/timings";

function formatEstimate(n: number, timings: Timings): string {
  if (n <= 1) return "";
  const totalMs = (n - 1) * timings.timeBetweenUnfollows
    + Math.floor((n - 1) / 5) * timings.timeToWaitAfterFiveUnfollows;
  const totalMins = Math.ceil(totalMs / 60000);
  if (totalMins >= 60) {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
  }
  return `~${totalMins}m`;
}

export interface SearchingProps {
  state: State;
  setState: (state: State) => void;
  scanningPaused: boolean;
  pauseScan: () => void;
  handleScanFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleUser: (checked: boolean, user: UserNode) => void;
  onWhitelistUpdate: (users: readonly UserNode[]) => void;
  currentTimings: Timings;
}

export const Searching = ({
  state,
  setState,
  scanningPaused,
  pauseScan,
  handleScanFilter,
  toggleUser,
  onWhitelistUpdate,
  currentTimings,
}: SearchingProps) => {
  if (state.status !== "scanning") {
    return null;
  }

  const usersForDisplay = getUsersForDisplay(
    state.results,
    state.whitelistedResults,
    state.currentTab,
    state.searchTerm,
    state.filter,
  );

  const getSectionKey = (user: UserNode): string => {
    switch (state.sortBy) {
      case "alphabetical": return user.username.substring(0, 1).toUpperCase();
      case "non_followers_first": return user.follows_viewer ? "follows_back" : "non_follower";
      case "verified_first": return user.is_verified ? "verified" : "rest";
    }
  };

  const getSectionLabel = (key: string): string => {
    switch (key) {
      case "follows_back": return "Follows you back";
      case "non_follower": return "Doesn't follow you back";
      case "verified": return "Verified accounts";
      case "rest": return "Everyone else";
      default: return key;
    }
  };

  let currentSection = "";

  return (
    <section className="flex">
      <aside className="app-sidebar">
        <div className="sidebar-content">
          <menu className="sidebar-filters-grid">
            <p>Filter</p>
            <label className="badge m-small">
              <input
                type="checkbox"
                name="showNonFollowers"
                checked={state.filter.showNonFollowers}
                onChange={handleScanFilter}
              />
              &nbsp;Non-Followers
            </label>
            <label className="badge m-small">
              <input
                type="checkbox"
                name="showFollowers"
                checked={state.filter.showFollowers}
                onChange={handleScanFilter}
              />
              &nbsp;Followers
            </label>
            <label className="badge m-small">
              <input
                type="checkbox"
                name="showVerified"
                checked={state.filter.showVerified}
                onChange={handleScanFilter}
              />
              &nbsp;Verified
            </label>
            <label className="badge m-small">
              <input
                type="checkbox"
                name="showPrivate"
                checked={state.filter.showPrivate}
                onChange={handleScanFilter}
              />
              &nbsp;Private
            </label>
            <label className="badge m-small">
              <input
                type="checkbox"
                name="showWithOutProfilePicture"
                checked={state.filter.showWithOutProfilePicture}
                onChange={handleScanFilter}
              />
              &nbsp;No Pic
            </label>
          </menu>

          <div className="sidebar-sort">
            <p>Sort by</p>
            <select
              className="sort-select"
              value={state.sortBy}
              onChange={e => setState({ ...state, sortBy: e.currentTarget.value as SortBy, page: 1 })}
            >
              <option value="non_followers_first">Non-followers first</option>
              <option value="alphabetical">A → Z</option>
              <option value="verified_first">Verified first</option>
            </select>
          </div>

          <div className="sidebar-buttons-grid">
            <button
              className="button-secondary"
              onClick={() => {
                const verifiedUsers = usersForDisplay.filter(u => u.is_verified);
                const currentIds = new Set(state.selectedResults.map(u => u.id));
                const toAdd = verifiedUsers.filter(u => !currentIds.has(u.id));
                setState({ ...state, selectedResults: [...state.selectedResults, ...toAdd] });
              }}
            >
              Verified
            </button>
            <button
              className="button-secondary"
              onClick={() => {
                const privateUsers = usersForDisplay.filter(u => u.is_private);
                const currentIds = new Set(state.selectedResults.map(u => u.id));
                const toAdd = privateUsers.filter(u => !currentIds.has(u.id));
                setState({ ...state, selectedResults: [...state.selectedResults, ...toAdd] });
              }}
            >
              Private
            </button>
            <button
              className="button-secondary"
              onClick={() => {
                const noPicUsers = usersForDisplay.filter(u => isWithoutProfilePicture(u));
                const currentIds = new Set(state.selectedResults.map(u => u.id));
                const toAdd = noPicUsers.filter(u => !currentIds.has(u.id));
                setState({ ...state, selectedResults: [...state.selectedResults, ...toAdd] });
              }}
            >
              No Pic
            </button>
            <button
              className="button-secondary danger-text"
              onClick={() => setState({ ...state, selectedResults: [] })}
            >
              Clear
            </button>
          </div>
          <div className="sidebar-stats">
            {state.percentage < 100 && (
              <p className="scan-progress">Scanning: {state.percentage}%</p>
            )}
            <p>Displayed: {usersForDisplay.length}</p>
            <p>Total Scanned: {state.results.length}</p>
            <p className="whitelist-counter">
              <span className="whitelist-badge">★</span> Whitelisted: {state.whitelistedResults.length}
            </p>
          </div>

          {state.percentage === 100 && (
            <div className="sidebar-summary">
              <h4>Scan Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Non-Followers</span>
                  <strong>{state.results.filter(u => !u.follows_viewer).length}</strong>
                </div>
                <div className="summary-item">
                  <span>Verified</span>
                  <strong>{state.results.filter(u => u.is_verified).length}</strong>
                </div>
                <div className="summary-item">
                  <span>Private</span>
                  <strong>{state.results.filter(u => u.is_private).length}</strong>
                </div>
              </div>
            </div>
          )}
          <div className="sidebar-footer-controls">
            <button
              className="button-control button-pause"
              onClick={pauseScan}
            >
              {scanningPaused ? "Resume" : "Pause"}
            </button>
            <div className="sidebar-pagination">
              <div className="pagination-controls">
                <a
                  onClick={() => {
                    if (state.page - 1 > 0) {
                      setState({
                        ...state,
                        page: state.page - 1,
                      });
                    }
                  }}
                >
                  ❮
                </a>
                <span>
                  {state.page}/{getMaxPage(usersForDisplay)}
                </span>
                <a
                  onClick={() => {
                    if (state.page < getMaxPage(usersForDisplay)) {
                      setState({
                        ...state,
                        page: state.page + 1,
                      });
                    }
                  }}
                >
                  ❯
                </a>
              </div>
            </div>
          </div>
        </div>
        <button
          className="unfollow"
          onClick={() => {
            if (!confirm(`Unfollow ${state.selectedResults.length} ${state.selectedResults.length === 1 ? "user" : "users"}? This cannot be undone.\nEstimated time: ${formatEstimate(state.selectedResults.length, currentTimings)}`)) {
              return;
            }
            //TODO TEMP until types are properly fixed
            // @ts-ignore
            setState(prevState => {
              if (prevState.status !== "scanning") {
                return prevState;
              }
              if (prevState.selectedResults.length === 0) {
                alert("Must select at least a single user to unfollow");
                return prevState;
              }
              const newState: State = {
                ...prevState,
                status: "unfollowing",
                percentage: 0,
                unfollowLog: [],
                filter: {
                  showSucceeded: true,
                  showFailed: true,
                },
              };
              return newState;
            });
          }}
        >
          UNFOLLOW ({state.selectedResults.length})
        </button>
      </aside>
      <article className="results-container">
        <nav className="tabs-container">
          <div
            className={`tab ${state.currentTab === "non_whitelisted" ? "tab-active" : ""}`}
            onClick={() => {
              if (state.currentTab === "non_whitelisted") {
                return;
              }
              setState({
                ...state,
                currentTab: "non_whitelisted",
                selectedResults: [],
              });
            }}
          >
            Non-Whitelisted
          </div>
          <div
            className={`tab ${state.currentTab === "whitelisted" ? "tab-active" : ""}`}
            onClick={() => {
              if (state.currentTab === "whitelisted") {
                return;
              }
              setState({
                ...state,
                currentTab: "whitelisted",
                selectedResults: [],
              });
            }}
          >
            Whitelisted
          </div>
        </nav>
        {usersForDisplay.length === 0 && state.percentage === 100 && (
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <p>No users match your current filters</p>
            <span>Try adjusting the filters in the sidebar</span>
          </div>
        )}
        {state.results.length === 0 && state.percentage < 100 && (
          <div className="skeleton-list">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-avatar" />
                <div className="skeleton-text">
                  <div className="skeleton-line skeleton-line--name" />
                  <div className="skeleton-line skeleton-line--sub" />
                  <div className="skeleton-line skeleton-line--badges" />
                </div>
              </div>
            ))}
          </div>
        )}
        {getCurrentPageUnfollowers(usersForDisplay, state.page, state.sortBy).map(user => {
          const sectionKey = getSectionKey(user);
          const isNewSection = sectionKey !== currentSection;
          if (isNewSection) {
            currentSection = sectionKey;
          }
          const isWhitelisted = state.whitelistedResults.some(r => r.id === user.id);
          const isSelected = state.selectedResults.some(s => s.id === user.id);
          const hasStory = user.reel?.latest_reel_media > 0;
          return (
            <React.Fragment key={user.id}>
              {isNewSection && (
                <div className={`section-header ${state.sortBy === "alphabetical" ? "section-header--letter" : "section-header--label"}`}>
                  {getSectionLabel(sectionKey)}
                </div>
              )}
              <label className={`result-item ${user.follows_viewer ? "mutual" : "non-follower"} ${isSelected ? "selected" : ""}`}>
                <div className="flex grow align-center gap-small">
                  <div className={`avatar-container ${hasStory ? "has-story" : ""}`} onClick={(e) => e.stopPropagation()}>
                    <img
                      className="avatar"
                      alt={user.username}
                      src={user.profile_pic_url}
                    />
                    <div className="avatar-preview">
                      <img src={user.profile_pic_url.replace("s150x150/", "s320x320/")} alt={user.username} />
                    </div>
                  </div>
                  <div className="user-info">
                    <div className="user-name-row">
                      <a
                        className="user-username"
                        target="_blank"
                        href={`/${user.username}`}
                        rel="noreferrer"
                      >
                        {user.username}
                      </a>
                      {user.is_verified && <span className="verified-badge">✔</span>}
                    </div>
                    {user.full_name && <span className="user-fullname">{user.full_name}</span>}
                    <div className="user-badge-row">
                      <span className={`relationship-badge ${user.follows_viewer ? "follows-back" : "non-follower"}`}>
                        {user.follows_viewer ? "Follows you" : "Doesn't follow"}
                      </span>
                      {user.is_private && <span className="badge-pill badge-private">Private</span>}
                      {user.requested_by_viewer && <span className="badge-pill badge-pending">Pending</span>}
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button
                    className={`whitelist-bookmark-button ${isWhitelisted ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const updatedWhitelist = isWhitelisted
                        ? state.whitelistedResults.filter(r => r.id !== user.id)
                        : [...state.whitelistedResults, user];
                      onWhitelistUpdate(updatedWhitelist);
                    }}
                    title={isWhitelisted ? "Remove from whitelist" : "Add to whitelist"}
                  >
                    🔖
                  </button>
                  <input
                    className="account-checkbox"
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => toggleUser(e.currentTarget.checked, user)}
                  />
                </div>
              </label>
            </React.Fragment>
          );
        })}
      </article>
    </section>
  );
};
