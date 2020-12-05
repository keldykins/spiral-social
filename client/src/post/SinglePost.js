import React, { Component } from "react";
import { singlePost, removePost, like, unlike } from "./apiPost";
import defaultPic from "../assets/mountain.jpg";
import { Link, Redirect } from "react-router-dom";
import { isAuthenticated } from "../auth";
import Comment from "./Comment";

class SinglePost extends Component {
  state = {
    post: "",
    redirect: false,
    redirectToSignin: false,
    like: false,
    likes: 0,
    comments: [],
  };

  checkLike = (likes) => {
    const userId = isAuthenticated() && isAuthenticated().user._id;
    let match = likes.indexOf(userId) !== -1;
    return match;
  };

  componentDidMount = () => {
    const postId = this.props.match.params.postId;
    singlePost(postId).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.setState({
          post: data,
          likes: data.likes.length,
          like: this.checkLike(data.likes),
          comments: data.comments
        });
      }
    });
  };

  commentList = (comments) => {
    this.setState({ comments });
  };

  toggleLike = () => {
    if (!isAuthenticated()) {
      this.setState({ redirectToSignin: true });
      return false;
    }
    let apiCall = this.state.like ? unlike : like;
    const userId = isAuthenticated().user._id;
    const postId = this.state.post._id;
    const token = isAuthenticated().token;
    apiCall(userId, token, postId).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.setState({
          like: !this.state.like,
          likes: data.likes.length,
        });
      }
    });
  };

  deletePost = () => {
    const postId = this.props.match.params.postId;
    const token = isAuthenticated().token;
    removePost(postId, token).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.setState({ redirect: true });
      }
    });
  };

  confirmDelete = () => {
    let answer = window.confirm("Are you sure you want to delete this post?");
    if (answer) {
      this.deletePost();
    }
  };

  renderPost = (post) => {
    const posterId = post.postedBy ? `/user/${post.postedBy._id}` : "";
    const posterName = post.postedBy ? post.postedBy.name : " Unknown";
    const { like, likes } = this.state;
    return (
      <div className="card-body">
        <img
          src={`/post/photo/${post._id}`}
          alt={post.title}
          onError={(i) => (i.target.src = `${defaultPic}`)}
          className="img-thumbnail mb-3"
          style={{ height: "100%", width: "100%", objectFit: "cover" }}
        />
        {like ? (
          <h6>
            <i
              className="fas fa-heart text-danger"
              onClick={this.toggleLike}
              style={{ padding: "10px" }}
            ></i>
            {likes} Like(s)
          </h6>
        ) : (
          <h6>
            <i
              className="far fa-heart text-danger"
              onClick={this.toggleLike}
              style={{ padding: "10px" }}
            ></i>
            {likes} Like(s)
          </h6>
        )}

        <p className="card-text">{post.body}</p>
        <br />
        <p className="font-italic mark">
          Posted by: <Link to={`${posterId}`}>{posterName} </Link>on{" "}
          {new Date(post.created).toDateString()}
        </p>
        <div className="d-inline-block">
          <Link to={`/`} className="btn btn-raised btn-primary btn-sm mr-5">
            Back to Posts
          </Link>

          {isAuthenticated().user &&
            isAuthenticated().user._id === post.postedBy._id && (
              <>
                <Link
                  to={`/post/edit/${post._id}`}
                  className="btn btn-raised btn-warning btn-sm mr-5"
                >
                  Update Post
                </Link>
                <button
                  onClick={this.confirmDelete}
                  className="btn btn-raised btn-danger mr-5"
                >
                  Delete Post
                </button>
              </>
            )}
        </div>
      </div>
    );
  };

  render() {
    const { post, redirect, redirectToSignin, comments } = this.state;

    if (redirect) {
      return <Redirect to={`/`} />;
    } else if (redirectToSignin) {
      return <Redirect to={`/signin`} />;
    }

    return (
      <div className="container" style={{marginTop: "90px", padding: "10px", borderRadius: "10px", backgroundColor: "rgba(255, 255, 255, 0.95)"}}>
        <h2 className="display-2 mt-5 mb-5">{post.title}</h2>
        {!post ? (
          <div className="jumbotron text-center">
            <h2>Please wait.</h2>
          </div>
        ) : (
          this.renderPost(post)
        )}
        <Comment
          postId={post._id}
          comments={comments.reverse()}
          commentList={this.commentList}
        />
      </div>
    );
  }
}

export default SinglePost;
