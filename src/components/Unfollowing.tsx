import React from "react";
import { getUnfollowLogForDisplay } from "../utils/utils";
import { State } from "../model/state";

interface UnfollowingProps {
  state: State;
  handleUnfollowFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;

}

export const Unfollowing = (
  {
    state,
    handleUnfollowFilter,
  }: UnfollowingProps) => {

  if (state.status !== "unfollowing") {
    return null;
  }

  return (
    <section className="flex">
      <aside className="app-sidebar">
        <menu className="flex column grow m-clear p-clear">
          <p>Filter</p>
          <label className="badge m-small">
            <input
              type="checkbox"
              name="showSucceeded"
              checked={state.filter.showSucceeded}
              onChange={handleUnfollowFilter}
            />
            &nbsp;Succeeded
          </label>
          <label className="badge m-small">
            <input
              type="checkbox"
              name="showFailed"
              checked={state.filter.showFailed}
              onChange={handleUnfollowFilter}
            />
            &nbsp;Failed
          </label>
        </menu>
      </aside>
      <article className="unfollow-log-container">
        {state.unfollowLog.length === state.selectedResults.length && state.selectedResults.length > 0 && (
          <div className="completion-banner">
            <span className="completion-check">✓</span>
            <div>
              <strong>{state.unfollowLog.filter(e => e.unfollowedSuccessfully).length} unfollowed successfully</strong>
              {state.unfollowLog.some(e => !e.unfollowedSuccessfully) && (
                <span className="completion-failed">
                  &nbsp;· {state.unfollowLog.filter(e => !e.unfollowedSuccessfully).length} failed
                </span>
              )}
            </div>
          </div>
        )}
        {getUnfollowLogForDisplay(state.unfollowLog, state.searchTerm, state.filter).map(
          (entry, index) => (
            <div className={`unfollow-log-entry ${entry.unfollowedSuccessfully ? "success" : "failed"}`} key={entry.user.id}>
              <img className="avatar avatar--small" src={entry.user.profile_pic_url} alt={entry.user.username} />
              <a className="unfollow-log-username" target="_blank" href={`../${entry.user.username}`} rel="noreferrer">
                {entry.user.username}
              </a>
              <span className="unfollow-log-status">
                {entry.unfollowedSuccessfully ? "Unfollowed" : "Failed"}
              </span>
              <span className="unfollow-log-index">{index + 1}/{state.selectedResults.length}</span>
            </div>
          )
        )}
      </article>
    </section>
  );
};
