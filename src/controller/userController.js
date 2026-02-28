import { blockUserService,  getNFTsUsers, getUserDetails, listUsersService, } from "../services/usersService.js";



export const listUsersController = async (req, res) => {
  try {
    // Extract pagination params
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const result = await listUsersService(page, limit);

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      ...result,
    });
  } catch (error) {
    console.error("❌ Error listUsers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const nftsUserController = async (req, res) => {
  let response;
  try {
    const idUser = req.params.id
    response = await getNFTsUsers(idUser);
    if (response.succes) {
      return res.json(response)
    }
    else
      return res.status(500).json(response)
  } catch (error) {
    return res.status(500).json(response)
  }
}


export const getDetailUserController = async (req, res) => {
  let response;
  try {
    const idUser = req.params.id
    response = await getUserDetails(idUser);
    if (response.succes)
      return res.json(response)
    else
      return res.status(500).json(response)
  } catch (error) {
    return res.status(500).json(response)
  }
}

export const blockUserController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await blockUserService(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error blockUser:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// export async function createAdminController(req, res) {
//   try {

//     const parsed = createAdminSchema.safeParse(req.body);

//     if (!parsed.success) {
//       return res.status(400).json({
//         success: false,
//         errors: parsed.error.errors.map(err => err.message),
//       });
//     }
//     const reponse = await createAdminService(parsed.data)

//     // if (reponse.success)
//     //   await createAdminLog({
//     //     admin_id: req.info.id,
//     //     entity_id : reponse.data.id,
//     //     action: "CREATE_ADMIN",
//     //     details: reponse.success ? { email: parsed.data.email, role: parsed.data.role } : "Failed"
//     //   });

//     if (reponse.success)
//       return res.status(200).json(reponse)
//     else
//       return res.status(500).json(reponse)
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Erreur interne du serveur",
//     });
//   }
// }

// export async function signupAdminController(req, res) {
//   try {
//     const parsed = signupSchema.safeParse(req.body);
//     console.log(req.body)
//     if (!parsed.success) {
//       return res.status(400).json({
//         success: false,
//         errors: parsed.error.errors.map(e => e.message)
//       });
//     }

//     const { adminId, email } = req.info; // injecté par middleware
//     const { password } = parsed.data;
//     const reponse = await signUpService({ id: adminId, email, password });
//     if (reponse.success)
//       await createAdminLog({
//         adminId: req.info.id,
//         action: "SIGNUP_ADMIN",
//         details: reponse.success ? "Signup completed" : "Failed signup"
//       });
//     return res.status(reponse.status).json(reponse)
//   } catch (error) {

//   }
// }

// export async function getMyProfileAdminController(req, res) {
//   try {
//     const userId = req.info.id;
//     const reponse = await getMyProfileAdmin(userId);
//     return res.status(reponse.success ? 200 : 500).json(reponse);
//   } catch (error) {
//     return { success: false, message: 'Erreur de serveur' };
//   }
// }






