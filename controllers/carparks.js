const Base = require("./base");
const auth = require("../middleware/auth");
const axios = require("axios");
const db = require("../models");

class Carparks extends Base {
  constructor(model) {
    super(model);
  }
  async showHomepage(req, res) {
    try {
      return res.json({
        value: "This is homepage. Carpark map as below: ",
        ura_accessKey: process.env.URA_ACCESS_KEY,
        ura_token: process.env.URA_TOKEN,
      });
    } catch (error) {
      res.status(500).json({ error: error.mesage });
    }
  }

  async getCarparksInfo(req, res) {
    try {
      const getToken = await axios.get(
        `https://www.ura.gov.sg/uraDataService/getTokenForm?txtAcessKey=${process.env.URA_ACCESS_KEY}`
      );
      let result = getToken.data.trim().split(/\s+/);
      let tokenStr = result.filter((el) => el.includes("value"));
      let idxArr = [];
      for (let i = 0; i < tokenStr[0].length; i += 1) {
        if (tokenStr[0][i] === '"') {
          idxArr.push(i);
        }
      }
      let URA_TOKEN = tokenStr[0].slice(idxArr[0] + 1, idxArr[1]);
      const Headers = {
        headers: {
          AccessKey: process.env.URA_ACCESS_KEY,
          Token: URA_TOKEN,
        },
      };

      // Fetch available carpark info:
      const getCarparksData = await axios.get(
        "https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Availability",
        {
          headers: {
            AccessKey: process.env.URA_ACCESS_KEY,
            Token: URA_TOKEN,
          },
        }
      );
      const availableCarparksdata = getCarparksData.data.Result;

      // Fetch carpark details:
      const getCarparksDetails = await axios.get(
        "https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Details",
        Headers
      );
      const carparkDetails = getCarparksDetails.data.Result;

      availableCarparksdata.map(async (carpark) => {
        const carparkInfo = {};
        carparkDetails.filter((c) => {
          if (c.ppCode === carpark.carparkNo) {
            carparkInfo.carparkNo = carpark.carparkNo;
            carparkInfo.carparkName = c.ppName;
            carparkInfo.lotType = carpark.lotType;
          }
        });
        const existingC = await this.model.findAll({
          where: {
            carparkNo: carpark.carparkNo,
            lotType: carpark.lotType,
          },
        });
        if (!existingC.length) {
          await this.model.create(carparkInfo);
        }
      });

      return res.json({
        value: "carpark data received!",
        carparks: availableCarparksdata,
      });
    } catch (error) {
      res.status(500).json({ error: error.mesage });
    }
  }

  async addCarpark(req, res) {
    const { userId, carparkNo, lotType } = req.body;
    console.log(req.body);
    try {
      const carpark = await this.model.findOne({
        where: {
          carparkNo: carparkNo,
          lotType: lotType,
        },
      });
      console.log("carpark found: ", carpark);
      const user = await db.User.findByPk(userId);
      await carpark.addUser(user);
      res.json("added favoriate carpark");
    } catch (error) {
      res.status(500).json({ error: error.mesage });
    }
  }

  async getFavoriteCarparks(req, res) {
    const userId = req.cookies.userId;
    console.log("user id: ", userId);
    try {
      const user = await db.User.findByPk(userId);
      const favoriteCarparks = await user.getCarparks({
        through: "user_carparks",
      });
      res.json({ favoriteCarparks });
    } catch (error) {
      res.status(500).json({ error: error.mesage });
    }
  }
}

module.exports = Carparks;
