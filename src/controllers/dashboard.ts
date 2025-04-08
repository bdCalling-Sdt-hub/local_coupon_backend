import { Request, Response } from "express";
import res from "@utils/response_handler";
import { Coupon, Notification, Payment, User } from "@db";

const get_dashboard = async (req: Request, response: Response) => {
  res.setRes(response);
  const { subscription_year, user_year } = req.query;

  const total_users = await User.countDocuments();
  const premium_users = await User.countDocuments({ isSubscribed: true });
  const business_owners = await User.countDocuments({ role: "business" });
  const coupons = await Coupon.countDocuments();

  const subscriptionData = await Payment.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${subscription_year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${subscription_year}-12-31T23:59:59.999Z`),
        },
      },
    },
  ]);

  const subscriptionChart = Array(12).fill(0);
  subscriptionData.forEach((entry) => {
    subscriptionChart[entry.createdAt.getMonth() - 1] += 1;
  });

  const subscription_growth = {
    year: subscription_year,
    chart: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      data: subscriptionChart,
    },
  };

  const userData = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${user_year}-01-01`),
          $lte: new Date(`${user_year}-12-31T23:59:59.999Z`),
        },
      },
    },
  ]);

  const activeUsersChart = Array(12).fill(0);
  const inactiveUsersChart = Array(12).fill(0);

  userData.forEach((user) => {
    const monthIdx = user.createdAt.getMonth();

    if (user.isSubscribed) {
      activeUsersChart[monthIdx] += 1;
    } else {
      inactiveUsersChart[monthIdx] += 1;
    }
  });

  const user_growth = {
    year: user_year,
    chart: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      legends: ["Active", "Inactive"],
      data: [activeUsersChart, inactiveUsersChart],
    },
  };

  const data = {
    total_users,
    premium_users,
    business_owners,
    coupons,
    subscription_growth,
    user_growth,
  };
  res.json({ message: "Dashboard data fetched successfully", data });
};

const get_recent_transactions = async (req: Request, response: Response) => {
  res.setRes(response);

  try {
    const transactions = await Coupon.find()
      .populate({
        path: "createdBy",
        select: "name",
      })
      .sort({ updatedAt: -1 });
    res.json({
      message: "Recent transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_notifications = async (req: Request, response: Response) => {
  res.setRes(response);

  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { get_dashboard, get_recent_transactions, get_notifications };
